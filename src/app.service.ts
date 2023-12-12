import { Injectable } from '@nestjs/common';
import { parse as papaParse } from 'papaparse';
import { db as mongodb } from './utils/db';
import { PurchaseProductEvent } from './types/purchase_product.event';
import { QueryMessage } from './types/query.msg';
import { ProductPageDTO } from './types/product_page.dto';
import { ProductDTO, ProductDetailDTO } from './types/product.dto';
import { ProductDetailSchema, ProductSchema } from './types/product.schema';

const sampleVideoUrl: string = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const coldStart = false;

@Injectable()
export class AppService {

    /**
   * read csv file
   * @param path
   */
  private async parseFile(path:string) :Promise<ProductDetailDTO[]>{
    const fs = require('fs');
    const file = fs.createReadStream(path);
    let parsedProductDetails : ProductDetailDTO[] = [];
    return new Promise(function (resolve) {
      papaParse(file, {
          header: true,
          skipEmptyLines: true,
          step: (row: any) => {
            let data = row.data;
            let pd: ProductDetailDTO = {
              name: data.title,
              id: data.asin,
              thumbnail_image: data.thumbnailImage,
              catalog: data['bestsellerPageData/categoryName'],
              published_date: new Date(),
              price: data['price/value'],
              stock_quantity: 3,
              description_text: [],
              description_images: [],
              description_videos: []
            };
            if (!pd.price) {
              pd.price = 100;
              pd.description_videos.push(sampleVideoUrl)
            } else {
              pd.price = Number(pd.price)
            }
            for (let i = 0; i <= 6; i++) {
              let img = data[`galleryThumbnails/${i}`];
              if (img) {
                pd.description_images.push(img);
              }
            }
            for (let i = 0; i <= 11; i++) {
              let img = data[`highResolutionImages/${i}`];
              if (img) {
                pd.description_images.push(img);
              }
            }
            if (data.description) {
              pd.description_text.push(data.description);
            }
            for (let i = 0; i <= 9; i++) {
              let overviewKey = data[`productOverview/${i}/key`];
              let overviewValue = data[`productOverview/${i}/value`];
              if (overviewKey) {
                pd.description_text.push(overviewKey + ': ' + overviewValue);
              }
            }
            for (let i = 0; i <= 9; i++) {
              let feature = data[`features/${i}`];
              if (feature) {
                pd.description_text.push(feature);
              }
            }
            // console.log(pd);
            parsedProductDetails.push(pd);
          },
          complete: function (results:any) {
              console.log('Papa parse completed.')
              resolve(parsedProductDetails)
          }
      });
    })
  }
  
  async listProducts(query: QueryMessage):Promise<ProductPageDTO> {
    console.log('listProducts - PRODUCT', JSON.stringify(query));
    let total = 0;
    let products: Array<ProductDTO> = [];
    if (coldStart) {
      const productDetails = await this.parseFile('./sample_data/dataset_amazon-bestsellers.csv');
      // console.log(this.productDetails);

      // upload to mongodb
      // const template: any = {...this.productDetails[0]};
      // for (const prop in template) {
      //   template[prop] = typeof template[prop];
      // }
      // const productSchema = new Schema<ProductDetailDTO>(template);
      mongodb.connect().then(connection => {
        const ProductDetailModel = connection.model<ProductDetailDTO & Document>('ProductDetail', ProductDetailSchema, 'products');
        productDetails.forEach(pd => new ProductDetailModel(pd).save());
      });

      products = productDetails.map(detail => new ProductDTO(detail));
    } else {
      const conn = await mongodb.connect();
      const skipAggregation = {
        $skip: (Number(query.page_num) -1) * (Number(query.page_size))
      };
      const limitAggregation = {
        $limit: Number(query.page_size)
      };

      if (query.search){
        const ProductDetail = conn.model('ProductDetail', ProductDetailSchema, 'products');
        const searchAggregation = {
          $search: {
            index: "order-demo-products-idx",
            text: {
              query: query.search,
              path: ["id", "name", "catalog", "description_text"]
            },
            count: {
              type: "total"
            },
            sort: {
              unused: {$meta: "searchScore"},
              published_date: -1
            }            
          }
        };
        let result = await ProductDetail.aggregate([
          searchAggregation,
          {
            $project: {
              id: 1,
              name: 1,
              thumbnail_image: 1,
              catalog: 1,
              published_date: 1,
              price: 1,
              stock_quantity: 1,
              "meta": "$$SEARCH_META",
            }
          },
          skipAggregation,
          limitAggregation,
        ]);
        total = result.length > 0 ? result[0].meta.count.total : 0;
        products = result.map(detail => new ProductDTO(detail));
      } else {
        const Product = conn.model('Product', ProductSchema, 'products');
        total = await Product.countDocuments({});
        products = await Product.aggregate([
          {
            $sort: { 'published_date': -1 }
          },
          { // TODO why product details is populated in the result?
            $project: {
              _id: 0,
              __v: 0,
              description_text: 0,
              description_images: 0,
              description_videos: 0,
            }
          },
          skipAggregation,
          limitAggregation,
        ]);
      }
      mongodb.disconnect();
    }
    
    return {
      page_num: query.page_num,
      page_size: query.page_size,
      page_data: products,
      total: total,
    };
  }

  // TODO
  async checkStock(query: QueryMessage):Promise<Array<Number>> {
    return [];
  }

  async getProductByID(id: string):Promise<ProductDetailDTO | null> {
    console.log('getProductByID - PRODUCT', id);
    const conn = await mongodb.connect();
    const ProductDetail = conn.model('ProductDetail', ProductDetailSchema, 'products');
    let productDetailDto: ProductDetailDTO | null = await ProductDetail.findOne({id: id});
    mongodb.disconnect();
    return productDetailDto;
  }

  // reduce stock for product
  async handleProductPurchased(data: PurchaseProductEvent) {
    console.log('handleProductPurchased - PRODUCT', JSON.stringify(data));
    const conn = await mongodb.connect();
    const ProductDetail = conn.model('ProductDetail', ProductDetailSchema, 'products');
    const product  = await ProductDetail.findOne({id: data.productId});
    if (product) {
      let inStockAmount = Number(product.stock_quantity) - data.purchasedAmount;
      product.stock_quantity = inStockAmount < 0 ? 0 : inStockAmount;
      product.save();
    }
    mongodb.disconnect();

  }
}

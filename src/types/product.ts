export class ProductDTO {
    id: string;
    name: string;
    thumbnail_image: string;
    catalog: string;
    published_date: Date;
    price: number;
    stock_quantity: number;
    
    constructor(productDetail: any) {
        this.id = productDetail.id;
        this.name = productDetail.name;
        this.thumbnail_image = productDetail.thumbnail_image;
        this.catalog = productDetail.catalog;
        this.published_date = productDetail.published_date;
        this.price = productDetail.price;
        this.stock_quantity = productDetail.stock_quantity;
    }
}

export class ProductDetailDTO {
    id: string;
    name: string;
    thumbnail_image: string;
    catalog: string;
    published_date: Date;
    price: number;
    stock_quantity: number;
    // additional image, video and text descriptions make a ProductDTO into a ProductDetailDTO
    description_text: Array<string>;
    description_images: Array<string>;
    description_videos: Array<string>;
}
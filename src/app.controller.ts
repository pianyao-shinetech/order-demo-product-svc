import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PurchaseProductEvent } from './types/purchase_product.event';
import { QueryMessage } from './types/query.msg';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // internal API: reduce stock for the product
  @EventPattern('product_purchased')
  handleProductPurchased(data: PurchaseProductEvent) {
    console.log('event received - PRODUCT', 'product_purchased');
    this.appService.handleProductPurchased(data);
  }

  // internal API: receive a list of comma separated product ids and return an array for in stock quantity
  @MessagePattern({ cmd: 'check_stock' })
  async checkStock(query: QueryMessage) {
    console.log('message received - PRODUCT', '{ cmd: `check_stock` }');
    return await this.appService.listProducts(query);
  }

  @MessagePattern({ cmd: 'list_products' })
  async getAllProducts(query: QueryMessage) {
    console.log('message received - PRODUCT', '{ cmd: `list_products` }');
    if (query.search) {
      query.search = query.search.trim();
    }
    return await this.appService.listProducts(query);
  }

  @MessagePattern({ cmd: 'get_product' })
  getProductByID(id: string) {
    console.log('message received - PRODUCT', '{ cmd: `list_products` }');
    return this.appService.getProductByID(id);
  }
}

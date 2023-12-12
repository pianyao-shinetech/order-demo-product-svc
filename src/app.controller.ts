import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PurchaseProductEvent } from './types/purchase-product.event';
import { QueryDTO } from './types/query';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('product_purchased')
  handleProductPurchased(data: PurchaseProductEvent) {
    console.log('event received - PRODUCT', 'product_purchased');
    this.appService.handleProductPurchased(data);
  }

  @MessagePattern({ cmd: 'list_products' })
  async getAllProducts(query: QueryDTO) {
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

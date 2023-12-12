import { ProductDTO } from './product.dto';

export class ProductPageDTO {
    page_num: number;
    page_size: number;
    page_data: Array<ProductDTO>;
    total: number;
}
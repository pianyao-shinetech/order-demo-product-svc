import { ProductDTO } from './product';

export class ProductPageDTO {
    page_num: number;
    page_size: number;
    page_data: Array<ProductDTO>;
    total: number;
}
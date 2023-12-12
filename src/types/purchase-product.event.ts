export class PurchaseProductEvent {
    constructor(
        public readonly productId: string,
        public readonly purchasedAmount: number
    ) {}
}
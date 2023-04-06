import { iOutputProductUsecase } from "src/domain/usecases/inventory";
import { iUsecase } from "../../../domain/contracts";
import { OrderEntity, ProductOutputRecord } from "../../../domain/entities";
import { BadRequestError} from "../../../domain/errors";
import { iCreateOrderUsecase } from "../../../domain/usecases/orders";
import { iDatabase } from "../../../infra/database/contracts";
import { iCompanyRepository, iOrderRepository } from "../../../infra/database/contracts/repositorys";

export class CreateOrderData implements iCreateOrderUsecase {

    constructor(
        private readonly sessionDataabse: iDatabase.iSession,
        private readonly orderRepository: iOrderRepository,
        private readonly companyRepository: iCompanyRepository,
        private readonly outputProductUsecase: iOutputProductUsecase
    ) { }

    async exec(input: iCreateOrderUsecase.Input, options?: iUsecase.Options): Promise<any> {

        const session = this.sessionDataabse.startSession();

        try {
            session.initTransaction();

            const company_id = input.company_id;
            const itens_orders: Array<ProductOutputRecord> = input.products


            const company = await this.companyRepository.findById(company_id)

            if (!company) throw new BadRequestError(`Company not found with ${company_id}.`)

            if (!itens_orders?.length) throw new BadRequestError(`Need one item for create Order.`)

            const recordOutputProducts = await this.outputProductUsecase.exec({
                company_id,
                items: itens_orders
            }, { session })

            const new_order: OrderEntity = {
                id: this.orderRepository.generateId(),
                company_id: company.id,
                itens: recordOutputProducts
            }

            const resultCreateOrder = await this.orderRepository.create(new OrderEntity(new_order), { session })

            if (!resultCreateOrder?.id) throw new BadRequestError(`Failed create order, try laiter.`)

            await session.commitTransaction();
            return {
                id: new_order.id
            }
        } catch (error) {
            await session.rollbackTransaction();
            throw error
        } finally {
            await session.endSession();
        }
    }
}
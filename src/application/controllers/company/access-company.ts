import { Controller } from "../../contracts";
import { HttpResponse } from "../../helpers/http-request";

export class AccessCompanyController extends Controller {
  async exec(): Promise<HttpResponse> {
    try {
      return Promise.resolve(this.sendSucess(200, { token: 'valid token' }));
    } catch (error) {
      return this.sendError(error);
    }
  }
}

import { Company } from '../../../domain/entities';
import { UnauthorizedError } from '../../../domain/errors';
import { iRegistrationCompany } from '../../../domain/usecases/company';
import { iCompanyRepository } from '../../../infra/database/contracts/repositorys';
import { mock, MockProxy } from 'jest-mock-extended';
import { RegistrationCompanyData } from './RegistrationCompany.data';
import { iCreateAuthenticateForCompanyUsecase } from '../../../domain/usecases/authentication';

describe('Registration Company', () => {
  let sut: iRegistrationCompany;

  let repositorySpy: MockProxy<iCompanyRepository>;
  let createAuthenticationForCompany : MockProxy<iCreateAuthenticateForCompanyUsecase>
  
  let fakeCompany: Company;
  let fakeNewCompany: iRegistrationCompany.input;
  let fakeReturnCreateAuth : iCreateAuthenticateForCompanyUsecase.output

  const unauthorizedErrorInHasRecordAuth = new UnauthorizedError('This CNPJ or Email has record, try change your passwoord.')

  beforeAll(() => {
    repositorySpy = mock();
    createAuthenticationForCompany = mock();
  });

  beforeEach(() => {
    sut = new RegistrationCompanyData(
      repositorySpy,
      createAuthenticationForCompany
    );

    fakeCompany = {
      _id : "01",
      name_fantasy: 'any_name',
      cnpj: 'any_cnpj',
      email: 'any_email'
    };

    fakeReturnCreateAuth = {
      authId : "010202",
      token : "token_auth_mock"
    }

    fakeNewCompany = {
      name_fantasy: 'any_name',
      cnpj: 'any_cnpj',
      email: 'any_email',
      password: 'any_password',
    };
  });

  it('Should return UnauthorizedError when Email has registraded.', async () => {
    createAuthenticationForCompany.exec.mockRejectedValue(unauthorizedErrorInHasRecordAuth)

    const response = sut.exec(fakeNewCompany);

    await expect(response).rejects.toThrow(
      unauthorizedErrorInHasRecordAuth
    );
  });

  it('Should return UnauthorizedError when CNPJ has registraded.', async () => {
    createAuthenticationForCompany.exec.mockRejectedValue(unauthorizedErrorInHasRecordAuth)

    const response = sut.exec(fakeNewCompany);

    await expect(response).rejects.toThrow(
      unauthorizedErrorInHasRecordAuth
    );
  });

  it('Should return token when record sucess company.', async () => {
    createAuthenticationForCompany.exec.mockResolvedValue(fakeReturnCreateAuth)

    repositorySpy.register.mockResolvedValue({_id : fakeCompany._id});

    const response = await sut.exec(fakeNewCompany);

    expect(response).toEqual(expect.objectContaining({ 
      token : fakeReturnCreateAuth.token
    }));
  });
});

import * as request from 'request';
import { parseString } from 'xml2js';

export enum Priority {
  VeryLow = -2,
  Moderate = -1,
  Normal = 0,
  High = 1,
  Emergency = 2
}

export interface IVerifyResult {
  valid: boolean,
  remainingCalls?: number;
  remainingCallsResetDate?: number;
}

export interface IRetrieveTokenResult {
  token: string;
  url: string;
  remainingCalls?: number;
  remainingCallsResetDate?: number;
}

export interface IRetrieveApikeyResult {
  apikey: string;
  remainingCalls?: number;
  remainingCallsResetDate?: number;
}

export interface IAddResult {
  remainingCalls: number;
  remainingCallsResetDate: number;
}

export interface IAddParameters {
  apiKey: string,
  providerKey?: string,
  priority?: Priority,
  url?: string,
  application: string,
  event: string,
  description: string
}

export default class Prowl {
  
  constructor(private apiEndpoint?: string) {
    if (!this.apiEndpoint) {
      this.apiEndpoint = 'https://api.prowlapp.com/publicapi';
    }
  }

  public getApiEndpoint(): string {
    return this.apiEndpoint;
  }

  public async add(parameters: IAddParameters): Promise<IAddResult> {
    let data: any = {
      apikey: parameters.apiKey,
      application: parameters.application,
      event: parameters.event,
      description: parameters.description
    };
    if (parameters.providerKey) {
      data['providerkey'] = parameters.providerKey;
    }
    if (parameters.priority) {
      data['priority'] = parameters.priority;
    }
    if (parameters.url) {
      data['url'] = parameters.url;
    }
    let result: any = await this.doRequest('add', 'POST', data);
    return {
      remainingCalls: parseInt(result.prowl.success[0].$.remaining),
      remainingCallsResetDate: parseInt(result.prowl.success[0].$.resetdate)
    }
  }

  public async verify(apiKey: string, providerKey?: string): Promise<IVerifyResult> {
    let ret: IVerifyResult;
    try {
      let data: any = { apikey: apiKey };
      if (providerKey) {
        data['providerkey'] = providerKey;
      }
      let result: any = await this.doRequest('verify', 'GET', data);
      ret = {
        valid: true,
        remainingCalls: parseInt(result.prowl.success[0].$.remaining),
        remainingCallsResetDate: parseInt(result.prowl.success[0].$.resetdate)
      }
    } catch (error) {
      if (error.code === 401) {
        ret = { valid: false };
      } else {
        throw error;
      }
    }
    return ret;
  }

  public async retrieveToken(providerKey: string): Promise<IRetrieveTokenResult> {
    let result: any = await this.doRequest('retrieve/token', 'GET', {
      providerkey: providerKey
    });
    return {
      token: result.prowl.retrieve[0].$.token,
      url: result.prowl.retrieve[0].$.url,
      remainingCalls: parseInt(result.prowl.success[0].$.remaining),
      remainingCallsResetDate: parseInt(result.prowl.success[0].$.resetdate)
    }
  }

  public async retrieveApikey(providerKey: string, token: string) {
    let result: any = await this.doRequest('retrieve/apikey', 'GET', {
      providerkey: providerKey,
      token: token
    });
    return {
      apikey: result.prowl.retrieve[0].$.apikey,
      remainingCalls: parseInt(result.prowl.success[0].$.remaining),
      remainingCallsResetDate: parseInt(result.prowl.success[0].$.resetdate)
    }
  }

  private async doRequest(endpoint: string, method: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let options: any = {
        method: method
      };
      if (method === 'POST') {
        options['form'] = data;
      } else {
        options['qs'] = data;
      }

      request(this.apiEndpoint + '/' + endpoint, options, (error, response, body) => {
        parseString(body, (err: any, result: any) => {
          if (response.statusCode === 200) {
            resolve(result);
          } else {
            reject({
              code: parseInt(result.prowl.error[0]['$'].code),
              message: result.prowl.error[0]['_']
            });
          }
        });
      });
    });
  }

}
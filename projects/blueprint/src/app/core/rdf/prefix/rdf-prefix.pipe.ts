import { Pipe, PipeTransform } from '@angular/core';
import { rdfEnvironment } from '../rdf-environment';

@Pipe({
  name: 'rdfPrefix'
})
export class RdfPrefixPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    console.log('RdfPrefixPipe transform', value, args);
    return rdfEnvironment.shrink(value);

  }

}

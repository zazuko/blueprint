import { Pipe, PipeTransform } from '@angular/core';
import { rdfEnvironment } from '../rdf-environment';

@Pipe({
  name: 'rdfPrefix'
})
export class RdfPrefixPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return rdfEnvironment.shrink(value);

  }

}

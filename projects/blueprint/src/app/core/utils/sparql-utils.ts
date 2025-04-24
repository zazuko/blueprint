import {
  Parser,
  Generator,
  SparqlParser,
  SparqlGenerator,
  ParserOptions,
  VariableTerm,
  ConstructQuery,
} from 'sparqljs';

import rdfEnvironment from '@zazuko/env/web';

class SparqlUtil {
  private _parser: SparqlParser;
  private _generator: SparqlGenerator;

  private _parserOptions: ParserOptions = {
    prefixes: undefined,
    baseIRI: undefined,
    factory: rdfEnvironment,
    sparqlStar: false,
  };

  constructor() {
    this._parser = new Parser(this._parserOptions);
    this._generator = new Generator();
  }

  public format(query: string): string | never {
    // Parse the input query using a SPARQL parser
    const parsedQuery = this._parser.parse(query);

    // Convert the parsed query back into a string using a generator
    const queryString = this._generator.stringify(parsedQuery);

    // Return the string representation of the query with the label (if provided)
    return queryString;
  }


  mergeConstruct(queries: string[]): string {
    // Parse each input query using a SPARQL parser
    const parsedQueries: Array<ConstructQuery | null> = queries.map(q => {
      try {
        const parsedQuery = this._parser.parse(q);
        if (parsedQuery.type !== 'query') {
          console.error(`Error wrong query type ${parsedQuery.type} for: ${q}`);
          console.error(`This query will be excluded`);
          return null;
        }
        if (parsedQuery.queryType !== 'CONSTRUCT') {
          console.error(`Error wrong query queryType ${parsedQuery.queryType} for: ${q}`);
          console.error(`This query will be excluded`);
          return null;
        }
        return parsedQuery as ConstructQuery;
      } catch (error) {
        console.error(`Error parsing query: ${q}`);
        if (error instanceof Error) { // use a type guard to narrow down the type
          console.error(`Error parsing query: ${q}`);
          console.error(`Error message: ${error.message}`);
        } else {
          console.error(`An unknown error occurred while parsing the query: ${q}`);
        }
        return null;
      }
    });

    // Remove any null parsed queries (due to parsing errors)
    const validParsedQueries = parsedQueries.filter(q => q !== null);


    const prefixSet = new Set<string>();


    validParsedQueries.forEach((query, index) => {
      Object.keys(query.prefixes).forEach((prefix) =>
        prefixSet.add(
          `${prefix.length === 0 ? '' : prefix}: ${query.prefixes[prefix]}`
        )
      );

      const varSet = new Set<VariableTerm>();
      this._eachRecursive(query, varSet, index);
      [...varSet].map((x) => (x.value = `${index}_${x.value}`));
    });

    // prefixes
    const prefixes: Prefix[] = [...prefixSet].map((p) => {
      const [prefix, ...rest] = p.split(':');
      const value = rest.join(':');
      return {
        prefix: prefix,
        value: value,
      };
    });

    // construct template
    const template = validParsedQueries.map((pq) => pq.template).flat();

    // union
    const union = {
      type: 'union',
      patterns: validParsedQueries.map((pq) => pq.where),
    };

    const query = {
      prefixes: this._toSparqlJsPrefix(prefixes),
      queryType: 'CONSTRUCT',
      template: template,
      type: 'query',
      where: [union],
    } as unknown as ConstructQuery;

    return this._generator.stringify(query);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _eachRecursive(obj: any, set: Set<any>, index: number) {
    for (const k in obj) {
      if (
        typeof obj[k] == 'object' &&
        obj[k] !== null &&
        obj[k]?.termType !== 'Variable' &&
        obj[k] !== 'values'
      )
        this._eachRecursive(obj[k], set, index);
      else {
        if (obj[k]?.termType === 'Variable') {
          set.add(obj[k]);
        }
        if (obj[k] === 'values') {
          obj.values.forEach((valO: object) => {

            Object.getOwnPropertyNames(valO).forEach((key) => {
              const oldKey = key;
              const newKey = `${oldKey[0]}${index}_${oldKey.substring(1)}`;
              const propertyDescriptor = Object.getOwnPropertyDescriptor(valO, oldKey);
              if (propertyDescriptor !== undefined) {
                Object.defineProperty(
                  valO,
                  newKey,
                  propertyDescriptor
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (valO as any)[oldKey];
              }

            });

          });
        }
      }
    }
  }

  private _toSparqlJsPrefix(prefix: Prefix[]): { [prefix: string]: string; } {
    // object type with key value paris both string
    const prefixObj: { [prefix: string]: string; } = {};

    prefix.forEach((p) => (prefixObj[p.prefix] = p.value.trim()));
    return prefixObj;
  }
}

interface Prefix {
  prefix: string;
  value: string;
}

export const sparqlUtils = new SparqlUtil();

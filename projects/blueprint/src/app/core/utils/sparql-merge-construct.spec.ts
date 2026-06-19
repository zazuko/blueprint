import { mergeConstructQueries } from './sparql-merge-construct';

describe('mergeConstructQueries', () => {
  it('should merge where clauses using UNION', () => {
    const query1 = `
      PREFIX ex: <http://example.org/>
      CONSTRUCT {
        ?s ex:name ?name .
      } WHERE {
        ?s ex:name ?name .
      }
    `;

    const query2 = `
      PREFIX ex: <http://example.org/>
      CONSTRUCT {
        ?s ex:age ?age .
      } WHERE {
        ?s ex:age ?age .
      }
    `;

    const merged = mergeConstructQueries([query1, query2]);
    
    // We expect the merged query to contain UNION
    expect(merged).toContain('UNION');
    expect(merged).toContain('0_s');
    expect(merged).toContain('1_s');
  });
});

import { Injectable } from '@angular/core';
import { SkosConcept, SkosConceptScheme } from '../model/skos.model';
import { TreeNode } from 'primeng/api';






@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryScheme: SkosConceptScheme;


  constructor() {



    this.categoryScheme = SkosConceptScheme.createEmptyConceptScheme();
    this.categoryScheme.prefLabel = 'Product range Scheme';
    this.categoryScheme.definition = 'The scheme for the product range of a company';


    const topConcept = this.categoryScheme.createEmptyConcept();
    topConcept.prefLabel = 'Product range';
    topConcept.definition = 'The product range of a company';
    topConcept.topConceptOf = [this.categoryScheme];
    this.categoryScheme.topConcepts = [topConcept];


    const dbAssetsConcept = this.categoryScheme.createEmptyConcept();
    dbAssetsConcept.prefLabel = 'Database Assets';
    dbAssetsConcept.definition = 'The database assets of a company';
    dbAssetsConcept.broader = topConcept;
    topConcept.narrower = [...topConcept.narrower, dbAssetsConcept];


    const dbSchema = this.categoryScheme.createEmptyConcept();
    dbSchema.prefLabel = 'Database Schema';
    dbSchema.definition = 'The database schema of a company';
    dbSchema.broader = dbAssetsConcept;
    dbAssetsConcept.narrower = [...dbAssetsConcept.narrower, dbSchema];


    const dbTable = this.categoryScheme.createEmptyConcept();
    dbTable.prefLabel = 'Database Table';
    dbTable.definition = 'The database table of a company';
    dbTable.broader = dbAssetsConcept;
    dbAssetsConcept.narrower = [...dbAssetsConcept.narrower, dbTable];

    console.log(topConcept.dataset.toCanonical());




  }

  public getNodes(): TreeNode<SkosConcept>[] {
    return this.categoryScheme.topConcepts.map((concept) => {
      return this.createNode(concept, null);
    });
  }

  private createNode(concept: SkosConcept, parent: TreeNode<SkosConcept> | null): TreeNode<SkosConcept> {
    console.log('create node', concept.iri.value);
    /**
     * 
     */
    const node: TreeNode<SkosConcept> = {
      key: concept.iri.value,
      data: concept,
      label: concept.prefLabel,
      // icon?: string;
      // expandedIcon?: string;
      // collapsedIcon?: string;

      /**
        * Specifies if the node has children. Used in lazy loading.
        * @defaultValue false
        */
      // leaf?: boolean;
      /**
       * Expanded state of the node.
       * @defaultValue false
       */
      //  expanded?: boolean;
      /**
       * Type of the node to match a template.
       */
      type: 'concept',
      /**
       * Parent of the node.
       */
      parent: parent


    };
    node.children = concept.narrower.map(narrower => this.createNode(narrower, node));


    return node;
  }


  get topConcepts(): SkosConcept[] {
    return this.categoryScheme.topConcepts;
  }



  // implementation here

}

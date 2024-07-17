import { Injectable } from '@angular/core';

import { Parser, Quad } from 'n3';

import { UiClassMetadata } from '@blueprint/model/ui-class-metadata/ui-class-metadata';
import { blueprint } from '@blueprint/ontology';
import { Dataset } from '@zazuko/env/lib/Dataset';
import rdfEnvironment from '@zazuko/env';

@Injectable({
  providedIn: 'root'
})
export class UiAppearanceReasonerService {
  reasoningRules: N3Rule[] = [];
  #parser = new Parser({ format: 'text/n3' });

  /**
   * This method converts the legacy class metadata to N3 rules and adds them to the reasoning rules
   * 
   * @param legacyClassMetadata UiClassMetadata[] containing the legacy class metadata
   */
  addLegacyConfiguration(legacyClassMetadata: UiClassMetadata[]) {
    legacyClassMetadata.forEach(metadata => {
      const n3RuleString = this.#migrateToN3Rule(metadata);
      const parsedRule = this.#parseN3Rule(n3RuleString);
      this.reasoningRules.push(parsedRule);
    });
  }

  #migrateToN3Rule(uiClassMetadata: UiClassMetadata) {
    const n3String = `
  {
    ?s a <${uiClassMetadata.targetNode.value}> 
  } => {
    ?s <${blueprint.colorIndex}> ${uiClassMetadata.colorIndex} .
    ?s <${blueprint.icon}> "${uiClassMetadata.icon}" .
    ?s <${blueprint.searchPriority}> ${uiClassMetadata.searchPriority} .
    ?s <${blueprint.label}> "${uiClassMetadata.label}" .
    ?s <${blueprint.comment}> "${uiClassMetadata.comment}" .
  } .
  `;
    return n3String;
  }

  reason(nTripleString: string): string {
    console.log(nTripleString);
    const parser = new Parser();
    const resultString = this.#fastSimpleReasoner(rdfEnvironment.dataset(parser.parse(nTripleString)));
    return resultString + nTripleString;
  }

  #fastSimpleReasoner(inputDataset: Dataset): string {
    const result = rdfEnvironment.dataset();
    const fastRules = this.reasoningRules.filter(rule => rule.isFastPossible);
    fastRules.forEach(rule => {
      const subjects = [...inputDataset.match(null, rule.match[0].predicate, rule.match[0].object)];
      subjects.forEach(subject => {
        rule.implies.forEach(impliesQuad => {
          result.add(rdfEnvironment.quad(subject.subject, impliesQuad.predicate, impliesQuad.object));
        });
      });
    });
    return result.toCanonical()
  }

  #parseN3Rule(rule: string): N3Rule {
    const ruleQuads: Quad[] = this.#parser.parse(rule);

    // a rule is something like this { match graph } => {implies graph}
    // the => is the implies <http://www.w3.org/2000/10/swap/log#implies>
    // find the quad with implies
    const impliesOperatorQuads: Quad | undefined = ruleQuads.filter(q => q.predicate.value === 'http://www.w3.org/2000/10/swap/log#implies');
    if (impliesOperatorQuads.length === 0 || impliesOperatorQuads.length > 1) {
      // this is an invalid rule or a more complex rule
      // we can't provide fast reasoning for this
      return {
        rule: rule,
        parsed: ruleQuads,
        match: [],
        implies: [],
        isFastPossible: false
      };
    }

    const impliesOperatorQuad = impliesOperatorQuads[0];
    const matchQuads = ruleQuads.filter(q => q.graph.value === impliesOperatorQuad.subject.value);
    const impliesQuads = ruleQuads.filter(q => q.graph.value === impliesOperatorQuad.object.value);

    if (matchQuads.length !== 1) {
      // this is a more complex rule
      // we can't provide fast reasoning for this
      return {
        rule: rule,
        parsed: ruleQuads,
        match: [],
        implies: [],
        isFastPossible: false
      };
    }

    if (matchQuads[0].subject.termType !== 'Variable' || matchQuads[0].predicate.termType !== 'NamedNode' || matchQuads[0].object.termType !== 'NamedNode') {
      // this is a more complex rule
      // we can't provide fast reasoning for this
      return {
        rule: rule,
        parsed: ruleQuads,
        match: [],
        implies: [],
        isFastPossible: false
      };
    }

    // check if all impliesQuads have a Variable in the subject and a Literal in the object
    const impliesQuadsWithVariables = impliesQuads.filter(q =>
      q.subject.termType === 'Variable' &&
      q.subject.value === matchQuads[0].subject.value &&
      q.predicate.termType === 'NamedNode' &&
      q.object.termType === 'Literal'
    );

    if (impliesQuadsWithVariables.length !== impliesQuads.length) {
      // this is a more complex rule
      // we can't provide fast reasoning for this
      return {
        rule: rule,
        parsed: ruleQuads,
        match: [],
        implies: [],
        isFastPossible: false
      };
    }

    return {
      rule: rule,
      parsed: ruleQuads,
      match: matchQuads,
      implies: impliesQuads,
      isFastPossible: true
    };
  }
}


interface N3Rule {
  rule: string;
  parsed: Quad[];
  match: Quad[];
  implies: Quad[];
  isFastPossible: boolean;
}
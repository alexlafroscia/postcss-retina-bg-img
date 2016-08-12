import { describe, it } from 'mocha';
import { expect } from 'chai';

import { queryCoversRange, distributeQueryAcrossQuery } from '../lib/utils/media-query';

describe('queryCoversRange', function() {
  describe('matches', function() {
    const sets = [
      {
        name: 'an exact match',
        less: '(min-width: 600px)',
        more: '(min-width: 600px)'
      },
      {
        name: 'the same query in a different order (AND)',
        less: '(min-width: 600px) and (max-width: 800px)',
        more: '(max-width: 800px) and (min-width: 600px)'
      },
      {
        name: 'the same query in a different order (OR)',
        less: '(min-width: 600px), (max-width: 800px)',
        more: '(max-width: 800px), (min-width: 600px)'
      },
      {
        name: 'a complex query with multiple `OR` and `AND` parts',
        less: '(min-width: 600px) and (max-width: 650px), (min-width: 700px) and (max-width: 750px)',
        more: '(min-width: 600px) and (max-width: 650px) and screen, (min-width: 700px) and (max-width: 750px) and screen',
      },
      {
        name: 'the same query parts combined with different operators',
        less: '(min-width: 600px), (max-width: 800px)',
        more: '(min-width: 600px) and (max-width: 800px)'
      }
    ];

    sets.forEach(function({ name, less, more }) {
      it(`accepts ${name}`, function() {
        expect(queryCoversRange(less, more)).to.be.ok;
      });
    });
  });

  describe('not matches', function() {
    const sets = [
      {
        name: 'a complete mismatch of query parts',
        less: '(min-width: 600px)',
        more: '(max-width: 800px)'
      },
      {
        name: 'a less restrictive query with parts not in the more restrictive query',
        less: '(min-width: 600px) and (max-width: 800px)',
        more: '(min-width: 600px)'
      }
    ];

    sets.forEach(function({ name, less, more }) {
      it(`rejects ${name}`, function() {
        expect(queryCoversRange(less, more)).not.to.be.ok;
      });
    });
  });
});

describe('distributeQueryAcrossQuery', function() {
  it('combines two basic queries', function() {
    const a = '(min-width: 600px)';
    const b = '(max-width: 800px)';
    const result = distributeQueryAcrossQuery(a, b);

    expect(result).to.equal(`${a} and ${b}`);
  });

  it('distributes a retina query with multiple parts', function() {
    const a = '(min-width: 600px), (max-width: 800px)';
    const b = 'screen';
    const result = distributeQueryAcrossQuery(a, b);

    expect(result).to.equal('(min-width: 600px) and screen, (max-width: 800px) and screen');
  });
});

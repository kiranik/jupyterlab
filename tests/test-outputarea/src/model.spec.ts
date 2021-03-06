// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { OutputModel } from '@jupyterlab/rendermime';

import { OutputAreaModel } from '@jupyterlab/outputarea';

import { NBTestUtils } from '@jupyterlab/testutils';

describe('outputarea/model', () => {
  let model: OutputAreaModel;

  beforeEach(() => {
    model = new OutputAreaModel();
  });

  afterEach(() => {
    model.dispose();
  });

  describe('OutputAreaModel', () => {
    describe('#constructor()', () => {
      it('should create an output area model', () => {
        expect(model).to.be.an.instanceof(OutputAreaModel);
      });

      it('should accept options', () => {
        const contentFactory = new OutputAreaModel.ContentFactory();
        model = new OutputAreaModel({
          values: NBTestUtils.DEFAULT_OUTPUTS,
          contentFactory,
          trusted: true
        });
        expect(model.contentFactory).to.equal(contentFactory);
        expect(model.trusted).to.equal(true);
      });
    });

    describe('#changed', () => {
      it('should be emitted when the model changes', () => {
        let called = false;
        model.changed.connect((sender, args) => {
          expect(sender).to.equal(model);
          expect(args.type).to.equal('add');
          expect(args.oldIndex).to.equal(-1);
          expect(args.newIndex).to.equal(0);
          expect(args.oldValues.length).to.equal(0);
          called = true;
        });
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        expect(called).to.equal(true);
      });
    });

    describe('#stateChanged', () => {
      it('should be emitted when an item changes', () => {
        let called = false;
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        model.stateChanged.connect((sender, args) => {
          expect(sender).to.equal(model);
          expect(args).to.be.undefined;
          called = true;
        });
        const output = model.get(0);
        output.setData({ ...output.data });
        expect(called).to.equal(true);
      });
    });

    describe('#length', () => {
      it('should get the length of the items in the model', () => {
        expect(model.length).to.equal(0);
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        expect(model.length).to.equal(1);
      });
    });

    describe('#trusted', () => {
      it('should be the trusted state of the model', () => {
        expect(model.trusted).to.equal(false);
      });

      it('should cause all of the cells to `set`', () => {
        let called = 0;
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        model.add(NBTestUtils.DEFAULT_OUTPUTS[1]);
        model.changed.connect(() => {
          called++;
        });
        model.trusted = true;
        expect(called).to.equal(2);
      });
    });

    describe('#contentFactory', () => {
      it('should be the content factory used by the model', () => {
        expect(model.contentFactory).to.equal(
          OutputAreaModel.defaultContentFactory
        );
      });
    });

    describe('#isDisposed', () => {
      it('should test whether the model is disposed', () => {
        expect(model.isDisposed).to.equal(false);
        model.dispose();
        expect(model.isDisposed).to.equal(true);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources used by the model', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        model.dispose();
        expect(model.isDisposed).to.equal(true);
        expect(model.length).to.equal(0);
      });

      it('should be safe to call more than once', () => {
        model.dispose();
        model.dispose();
        expect(model.isDisposed).to.equal(true);
      });
    });

    describe('#get()', () => {
      it('should get the item at the specified index', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        const output = model.get(0);
        expect(output.type).to.equal(
          NBTestUtils.DEFAULT_OUTPUTS[0].output_type
        );
      });

      it('should return `undefined` if out of range', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        expect(model.get(1)).to.be.undefined;
      });
    });

    describe('#add()', () => {
      it('should add an output', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        expect(model.length).to.equal(1);
      });

      it('should consolidate consecutive stream outputs of the same kind', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        model.add(NBTestUtils.DEFAULT_OUTPUTS[1]);
        expect(model.length).to.equal(2);
        model.add(NBTestUtils.DEFAULT_OUTPUTS[2]);
        expect(model.length).to.equal(2);
      });
    });

    describe('#clear()', () => {
      it('should clear all of the output', () => {
        for (const output of NBTestUtils.DEFAULT_OUTPUTS) {
          model.add(output);
        }
        model.clear();
        expect(model.length).to.equal(0);
      });

      it('should wait for next add if requested', () => {
        model.add(NBTestUtils.DEFAULT_OUTPUTS[0]);
        model.clear(true);
        expect(model.length).to.equal(1);
        model.add(NBTestUtils.DEFAULT_OUTPUTS[1]);
        expect(model.length).to.equal(1);
      });
    });

    describe('#fromJSON()', () => {
      it('should deserialize the model from JSON', () => {
        model.clear();
        model.fromJSON(NBTestUtils.DEFAULT_OUTPUTS);
        expect(model.toJSON().length).to.equal(5);
      });
    });

    describe('#toJSON()', () => {
      it('should serialize the model to JSON', () => {
        expect(model.toJSON()).to.deep.equal([]);
        model.fromJSON(NBTestUtils.DEFAULT_OUTPUTS);
        expect(model.toJSON().length).to.equal(5);
      });
    });
  });

  describe('.ContentFactory', () => {
    describe('#createOutputModel()', () => {
      it('should create an output model', () => {
        const factory = new OutputAreaModel.ContentFactory();
        const model = factory.createOutputModel({
          value: NBTestUtils.DEFAULT_OUTPUTS[0]
        });
        expect(model).to.be.an.instanceof(OutputModel);
      });
    });
  });

  describe('.defaultContentFactory', () => {
    it('should be an instance of ContentFactory', () => {
      expect(OutputAreaModel.defaultContentFactory).to.be.an.instanceof(
        OutputAreaModel.ContentFactory
      );
    });
  });
});

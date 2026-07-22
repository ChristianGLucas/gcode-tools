// Shared AxiomContext test double for gcode-tools node tests. NOT a test
// file itself (jest.config.js only collects nodes/**/*_test.ts).

import { AxiomContext, AxiomLogger, AxiomSecrets, AxiomReflection, AxiomMutation } from '../gen/axiomContext';

const testReflection: AxiomReflection = {
  flow: {
    nodes: [],
    edges: [],
    loopEdges: [],
    position: { currentInstance: 0, depth: 0, loopIterations: {}, subflowStackGraphIds: [] },
    graphId: '',
  },
};

const testMutation: AxiomMutation = {
  flow: {
    addNode: (_packageName: string, _packageVersion: string) => 0,
    addEdge: (_srcInstance: number, _dstInstance: number) => {},
  },
};

export const testContext: AxiomContext = {
  log: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  } satisfies AxiomLogger,
  secrets: {
    get: (_name: string): [string, boolean] => ['', false],
  } satisfies AxiomSecrets,
  executionId: 'test-execution-id',
  flowId: 'test-flow-id',
  tenantId: 'test-tenant-id',
  reflection: testReflection,
  mutation: testMutation,
};

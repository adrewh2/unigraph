import mermaid from 'mermaid';

// Define your Mermaid graph as a string
const mermaidGraph = `
graph TD;
  A-->B-->C
  A-->C
`;

// Configure Mermaid to use the desired settings
mermaid.initialize({
  startOnLoad: false,
});

const parser = (
  await mermaid.mermaidAPI.getDiagramFromText(mermaidGraph)
).getParser().yy;

const generateTypescript = () => {
  const statements = {};
  const vertices = parser.getVertices();
};

const edges = parser.getEdges();
/* Output:
[
  {
    start: 'A',
    end: 'B',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'A',
    end: 'C',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'B',
    end: 'D',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  },
  {
    start: 'C',
    end: 'D',
    type: 'arrow_point',
    text: '',
    labelType: 'text',
    stroke: 'normal',
    length: 1
  }
]
*/

const vertices = parser.getVertices();

/* Output:
{
  A: {
    id: 'A',
    labelType: 'text',
    domId: 'flowchart-A-0',
    styles: [],
    classes: [],
    text: 'A',
    props: {}
  },
  B: {
    id: 'B',
    labelType: 'text',
    domId: 'flowchart-B-1',
    styles: [],
    classes: [],
    text: 'B',
    props: {}
  },
  C: {
    id: 'C',
    labelType: 'text',
    domId: 'flowchart-C-2',
    styles: [],
    classes: [],
    text: 'C',
    props: {}
  },
  D: {
    id: 'D',
    labelType: 'text',
    domId: 'flowchart-D-5',
    styles: [],
    classes: [],
    text: 'D',
    props: {}
  }
}

*/

function traverse(vertex: string, visited: { [key: string]: string }): string {
  if (visited[vertex]) {
    return visited[vertex];
  }

  const currentVertex = vertices[vertex];
  const args = Object.values(edges)
      .filter((edge: any) => (edge as any).start === vertex)
      .map((edge: any) => `${traverse((edge as any).end, visited)}`)
      .join(', ');

  visited[vertex] = `out_${vertex.toLowerCase()}`;
  return `${visited[vertex]} = ${currentVertex.id}(${args})`;
}

let output = '';

for (const vertex in vertices) {
  output += `${traverse(vertex, {})}\n`;
}

console.log(output);

export const defaultSource = `flowchart TD
  A[Idea] --> B[Write Mermaid]
  B --> C[Render Preview]
  C --> D[Export SVG/PNG/JPEG]
  D --> E[Ship to GitHub Pages]
`;

export const presets = [
  {
    id: "flowchart",
    title: "Flowchart",
    description: "The classic process diagram with quick styling wins.",
    source: `flowchart LR
  A[Start] --> B{Choice}
  B -->|Yes| C[Build]
  B -->|No| D[Refine]
  C --> E[Export]
  D --> E
`,
  },
  {
    id: "sequence",
    title: "Sequence",
    description: "Communicate a request/response flow clearly.",
    source: `sequenceDiagram
  participant U as User
  participant A as App
  participant M as Mermaid
  U->>A: Paste diagram text
  A->>M: Render diagram
  M-->>A: SVG markup
  A-->>U: Preview + export options
`,
  },
  {
    id: "class",
    title: "Class",
    description: "Model object-oriented structures and relationships.",
    source: `classDiagram
  class Animal {
    +String name
    +int age
    +makeSound() void
  }
  class Dog {
    +fetch() void
  }
  class Cat {
    +purr() void
  }
  Animal <|-- Dog
  Animal <|-- Cat
`,
  },
  {
    id: "state",
    title: "State",
    description: "Illustrate state transitions and lifecycle events.",
    source: `stateDiagram-v2
  [*] --> Idle
  Idle --> Processing : Start
  Processing --> Done : Complete
  Processing --> Error : Fail
  Error --> Idle : Reset
  Done --> [*]
`,
  },
  {
    id: "er",
    title: "ER Diagram",
    description: "Entity-relationship diagrams for database modeling.",
    source: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "is in"
  CUSTOMER {
    string name
    string email
  }
  ORDER {
    int id
    date created
  }
`,
  },
  {
    id: "journey",
    title: "Journey",
    description: "Show an experience path with emphasis on sentiment.",
    source: `journey
  title Diagram journey
  section Draft
    Write text: 5: Me
    Fix syntax: 3: Me
  section Polish
    Style it: 4: Me
    Export it: 5: Me
`,
  },
  {
    id: "gantt",
    title: "Gantt",
    description: "Plan a small roadmap with dates and milestones.",
    source: `gantt
  title Mermaid Visualizer Roadmap
  dateFormat  YYYY-MM-DD
  section Core
  Editor and preview      :done, a1, 2026-03-01, 3d
  Export buttons          :active, a2, after a1, 4d
  section Launch
  GitHub Pages deployment :a3, after a2, 2d
`,
  },
  {
    id: "pie",
    title: "Pie Chart",
    description: "Simple proportion visualization for quick metrics.",
    source: `pie title Project Time Allocation
  "Development" : 45
  "Testing" : 20
  "Documentation" : 15
  "Design" : 12
  "Meetings" : 8
`,
  },
  {
    id: "gitgraph",
    title: "Git Graph",
    description: "Visualize branching and merge strategies.",
    source: `gitGraph
  commit
  branch develop
  checkout develop
  commit
  commit
  checkout main
  merge develop
  commit
  branch feature
  checkout feature
  commit
  checkout main
  merge feature
`,
  },
  {
    id: "mindmap",
    title: "Mindmap",
    description: "Brainstorm and organize ideas hierarchically.",
    source: `mindmap
  root((Mermaid))
    Diagrams
      Flowchart
      Sequence
      Class
    Export
      SVG
      PNG
      JPEG
    Themes
      Light
      Dark
      Forest
`,
  },
  {
    id: "timeline",
    title: "Timeline",
    description: "Show events along a chronological axis.",
    source: `timeline
  title Project Milestones
  2026-01 : Concept
          : Research
  2026-02 : Prototype
          : User testing
  2026-03 : Launch
          : Marketing
`,
  },
  {
    id: "quadrant",
    title: "Quadrant",
    description: "Plot items on a two-axis priority grid.",
    source: `quadrantChart
  title Feature Priority Matrix
  x-axis Low Effort --> High Effort
  y-axis Low Impact --> High Impact
  quadrant-1 Plan carefully
  quadrant-2 Do first
  quadrant-3 Delegate
  quadrant-4 Eliminate
  Feature A: [0.2, 0.8]
  Feature B: [0.7, 0.9]
  Feature C: [0.3, 0.3]
  Feature D: [0.8, 0.2]
`,
  },
];

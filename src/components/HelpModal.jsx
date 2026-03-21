export default function HelpModal({ onClose }) {
  return (
    <aside className="settings-drawer help-modal" aria-labelledby="help-title" role="dialog" aria-modal="true">
      <div className="settings-drawer-header">
        <div>
          <p className="eyebrow">Documentation</p>
          <h2 id="help-title">Mermaid diagram guide</h2>
          <p className="settings-copy">
            A quick reference for building diagrams with Mermaid syntax.
          </p>
        </div>
        <button
          className="button secondary compact-button"
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Flowchart</h3>
          <p>Visualize processes and decision trees with directed graphs.</p>
        </div>
        <pre className="help-code">{`flowchart TD
  A[Start] --> B{Decision?}
  B -- Yes --> C[Do something]
  B -- No  --> D[Do other thing]
  C --> E[End]
  D --> E`}</pre>
        <ul className="help-list">
          <li><code>TD</code> / <code>LR</code> — top-down or left-right layout</li>
          <li><code>[Label]</code> rectangle · <code>(Label)</code> rounded · <code>{"{Label}"}</code> diamond</li>
          <li><code>--&gt;</code> solid arrow · <code>---</code> line · <code>-.-&gt;</code> dashed arrow</li>
          <li>Add edge labels: <code>A -- text --&gt; B</code></li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Sequence diagram</h3>
          <p>Show interactions between participants over time.</p>
        </div>
        <pre className="help-code">{`sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello Bob!
  Bob-->>Alice: Hi Alice!
  Alice->>Bob: How are you?`}</pre>
        <ul className="help-list">
          <li><code>-&gt;&gt;</code> solid arrow · <code>--&gt;&gt;</code> dashed arrow</li>
          <li><code>-&gt;+</code> / <code>--&gt;-</code> activate / deactivate lifeline</li>
          <li><code>Note over A,B: text</code> — annotate participants</li>
          <li><code>loop … end</code>, <code>alt … else … end</code>, <code>opt … end</code></li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Class diagram</h3>
          <p>Model object-oriented structures and relationships.</p>
        </div>
        <pre className="help-code">{`classDiagram
  class Animal {
    +String name
    +makeSound() void
  }
  class Dog {
    +fetch() void
  }
  Animal <|-- Dog`}</pre>
        <ul className="help-list">
          <li><code>+</code> public · <code>-</code> private · <code>#</code> protected</li>
          <li><code>&lt;|--</code> inheritance · <code>*--</code> composition · <code>o--</code> aggregation</li>
          <li>Add methods: <code>+methodName(param) ReturnType</code></li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Entity relationship (ER)</h3>
          <p>Define database schema and table relationships.</p>
        </div>
        <pre className="help-code">{`erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE-ITEM : contains
  CUSTOMER {
    string name
    string email
  }`}</pre>
        <ul className="help-list">
          <li><code>||</code> exactly one · <code>o|</code> zero or one · <code>&#123;&#125;</code> zero or many</li>
          <li>Relationship label goes after the colon</li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>State diagram</h3>
          <p>Represent state machines and transitions.</p>
        </div>
        <pre className="help-code">{`stateDiagram-v2
  [*] --> Idle
  Idle --> Processing : start
  Processing --> Done : finish
  Processing --> Error : fail
  Done --> [*]`}</pre>
        <ul className="help-list">
          <li><code>[*]</code> marks the start / end states</li>
          <li>Transition label after the colon: <code>A --&gt; B : event</code></li>
          <li>Nested states: wrap with <code>state Name &#123; … &#125;</code></li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Gantt chart</h3>
          <p>Plan project timelines and task dependencies.</p>
        </div>
        <pre className="help-code">{`gantt
  title Project plan
  dateFormat YYYY-MM-DD
  section Design
    Wireframes   : a1, 2024-01-01, 7d
    Mockups      : a2, after a1, 5d
  section Build
    Development  : 2024-01-13, 10d`}</pre>
        <ul className="help-list">
          <li>Sections group related tasks</li>
          <li>Use <code>after &lt;id&gt;</code> for sequential dependencies</li>
          <li>Mark tasks <code>done</code>, <code>active</code>, or <code>crit</code></li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Pie chart</h3>
          <p>Show proportional data as slices of a pie.</p>
        </div>
        <pre className="help-code">{`pie title Browser share
  "Chrome"  : 65.5
  "Safari"  : 18.9
  "Firefox" : 4.0
  "Other"   : 11.6`}</pre>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>Mindmap</h3>
          <p>Capture ideas and hierarchies in a radial layout.</p>
        </div>
        <pre className="help-code">{`mindmap
  root((Project))
    Research
      Competitors
      Users
    Design
      Wireframes
      Prototypes
    Build`}</pre>
        <ul className="help-list">
          <li>Indentation defines the hierarchy</li>
          <li><code>((text))</code> circle · <code>[text]</code> square · <code>(text)</code> rounded</li>
        </ul>
      </section>

      <section className="control-card">
        <div className="control-card-header">
          <h3>General tips</h3>
          <p>Get the most out of the editor.</p>
        </div>
        <ul className="help-list">
          <li>Start every diagram with its <strong>type keyword</strong> on the first line.</li>
          <li>Use the <strong>Presets</strong> panel to load ready-made examples.</li>
          <li>
            <kbd>Ctrl</kbd>+<kbd>S</kbd> saves a named diagram &middot;{" "}
            <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> exports SVG &middot;{" "}
            <kbd>F11</kbd> fullscreen
          </li>
          <li>
            Full syntax reference:{" "}
            <a
              href="https://mermaid.js.org/intro/"
              target="_blank"
              rel="noreferrer"
            >
              mermaid.js.org
            </a>
          </li>
        </ul>
      </section>
    </aside>
  );
}

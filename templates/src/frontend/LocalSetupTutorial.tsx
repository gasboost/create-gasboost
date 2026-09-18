import { useMemo, useState } from "react";
import logo from "../../assets/gasboost-logo.png";
import "./LocalSetupTutorial.css";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const totalSteps = 6;

const setupTasks = [
  "Googleアカウント認証",
  "Apps Script API有効化",
  "Apps Scriptプロジェクト接続",
  "Firebaseプロジェクト作成",
  "Firebase SDK・RTDB設定",
  "初期デプロイ",
] as const;

export function LocalSetupTutorial() {
  const [step, setStep] = useState<Step>(1);
  const [completed, setCompleted] = useState(0);
  const [scriptId, setScriptId] = useState("");
  const [apiEnabled, setApiEnabled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [setupMode, setSetupMode] = useState<SetupMode>("existing");
  const [firebaseProjectName, setFirebaseProjectName] = useState("");
  const [firebaseSdkCode, setFirebaseSdkCode] = useState("");

  const claspJson = useMemo(
    () =>
      JSON.stringify(
        {
          scriptId: scriptId.trim() || "<YOUR_SCRIPT_ID>",
          rootDir: "./dist",
        },
        null,
        2,
      ),
    [scriptId],
  );

  const oneLiner = useMemo(
    () =>
      `echo '${JSON.stringify({
        scriptId: scriptId.trim() || "<YOUR_SCRIPT_ID>",
        rootDir: "./dist",
      })}' > .clasp.json`,
    [scriptId],
  );

  const firebaseSetupCommand = useMemo(() => {
    const projectName =
      firebaseProjectName.trim() || "<YOUR_FIREBASE_PROJECT_NAME>";
    const sdkCode =
      firebaseSdkCode.trim().replace("const app", "export const app") ||
      `// Firebase ConsoleからコピーしたSDK設定コードを貼り付けてください`;

    return `pnpm add firebase

pnpm add -D firebase-tools @gasboost/cli

cat > gasboost.config.ts <<'GASBOOST_CONFIG'
import { defineGasboostConfig } from "@gasboost/cli";

export default defineGasboostConfig({
  rtdb: {
    source: "./src/server/lib/rtdb.ts",
    out: "./database.rules.json",
  },
});
GASBOOST_CONFIG

cat > firebase.json <<'FIREBASE_JSON'
{
  "database": {
    "rules": "database.rules.json"
  }
}
FIREBASE_JSON

cat >> .env <<'EOF'
VITE_FIREBASE_PROJECT_NAME=my-project
EOF

mkdir -p src/frontend/lib

cat > src/frontend/lib/firebase.ts <<'FIREBASE_SDK'
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

${sdkCode}
export const firebaseDatabase = getDatabase(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);

FIREBASE_SDK

pnpm gasboost rtdb rules

pnpm firebase login

pnpm firebase deploy --only database --project ${JSON.stringify(projectName)}`;
  }, [firebaseProjectName, firebaseSdkCode]);

  function goToStep(nextStep: Step, completedStep?: Step) {
    if (completedStep) {
      setCompleted((current) => Math.max(current, completedStep));
    }
    setStep(nextStep);
  }

  function showToast(message: string) {
    setToast(message);

    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 2000);
  }

  async function copy(value: string, message = "Copied") {
    try {
      await navigator.clipboard.writeText(value);
      showToast(message);
    } catch {
      showToast("Failed to copy");
    }
  }

  async function pasteScriptId() {
    try {
      const value = await navigator.clipboard.readText();

      if (!value) {
        return;
      }

      setScriptId(value.trim());
      showToast("Pasted Script ID");
    } catch {
      showToast("Please allow clipboard access");
    }
  }

  function skipSetup() {
    const url = new URL(window.location.href);
    url.searchParams.set("skipSetup", "true");
    window.location.href = url.toString();
  }

  const currentOrigin = window.location.origin;

  return (
    <div className="local-setup">
      {toast && <Toast message={toast} />}

      <Header onSkip={skipSetup} />

      <main className="local-setup__main">
        <div className="local-setup__container">
          <section className="local-context">
            <div>
              <div className="local-context__eyebrow">
                SEQUENTIAL DEPLOYMENT WORKFLOW
              </div>
              <h1>ローカルセットアップ</h1>
            </div>
            <div className="local-progress-badge">
              進捗:{" "}
              <strong>
                {completed} / {totalSteps} 完了
              </strong>
            </div>
          </section>

          <div className="local-workflow">
            <aside className="local-task-rail">
              <div className="local-task-rail__header">
                <span>WORKFLOW TASKS</span>
                <span className="local-rail-chip">順次実行</span>
              </div>

              <TaskNavigation
                step={step}
                completed={completed}
                onSelect={goToStep}
              />

              <div className="local-rail-progress">
                <span>進行ステータス</span>
                <span>
                  進捗:{" "}
                  <strong>
                    {completed} / {totalSteps} 完了
                  </strong>
                </span>
              </div>

              <div className="runtime-status">
                <span className="runtime-status__item">
                  <span className="status-dot status-dot--healthy" />
                  {currentOrigin}
                </span>
              </div>
            </aside>

            <section className="wizard" aria-live="polite">
              {step === 1 && (
                <StepOne
                  onCopy={(value) =>
                    copy(value, "Copied the clasp login command")
                  }
                  onNext={() => goToStep(2, 1)}
                />
              )}

              {step === 2 && (
                <StepTwo
                  checked={apiEnabled}
                  onCheckedChange={(checked) => {
                    setApiEnabled(checked);

                    if (checked) {
                      showToast("Confirmed Apps Script API is enabled");
                    }
                  }}
                  onBack={() => goToStep(1)}
                  onNext={() => goToStep(3, 2)}
                />
              )}

              {step === 3 && (
                <StepThree
                  setupMode={setupMode}
                  onSetupModeChange={setSetupMode}
                  scriptId={scriptId}
                  claspJson={claspJson}
                  oneLiner={oneLiner}
                  onScriptIdChange={setScriptId}
                  onPaste={pasteScriptId}
                  onClear={() => setScriptId("")}
                  onCopy={copy}
                  onBack={() => goToStep(2)}
                  onNext={() => goToStep(4, 3)}
                />
              )}

              {step === 4 && (
                <StepFour
                  firebaseProjectName={firebaseProjectName}
                  onFirebaseProjectNameChange={setFirebaseProjectName}
                  onBack={() => goToStep(3)}
                  onNext={() => goToStep(5, 4)}
                />
              )}

              {step === 5 && (
                <StepFive
                  firebaseSdkCode={firebaseSdkCode}
                  firebaseProjectName={firebaseProjectName}
                  setupCommand={firebaseSetupCommand}
                  onFirebaseSdkCodeChange={setFirebaseSdkCode}
                  onCopy={copy}
                  onBack={() => goToStep(4)}
                  onNext={() => goToStep(6, 5)}
                />
              )}

              {step === 6 && (
                <StepSix
                  onCopy={copy}
                  onBack={() => goToStep(5)}
                  onFinish={skipSetup}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer onSkip={skipSetup} />
    </div>
  );
}

type SetupMode = "new" | "existing";

function Header({ onSkip }: { onSkip: () => void }) {
  return (
    <header className="local-header">
      <div className="local-header__inner">
        <div className="brand">
          <img src={logo} alt="gasboost logo" className="brand__mark" />

          <strong className="brand__name">gasboost</strong>

          <span className="brand__separator">/</span>

          <span className="brand__page">Initial Deployment Tutorial</span>
        </div>
      </div>
    </header>
  );
}

function TaskNavigation({
  step,
  completed,
  onSelect,
}: {
  step: Step;
  completed: number;
  onSelect: (step: Step) => void;
}) {
  return (
    <nav className="local-task-list" aria-label="Setup workflow">
      {setupTasks.map((label, index) => {
        const taskStep = (index + 1) as Step;
        const done = taskStep <= completed;
        const active = taskStep === completed + 1;
        const selected = taskStep === step;

        return (
          <button
            key={label}
            type="button"
            className={[
              "local-task-item",
              active ? "local-task-item--active" : "",
              done ? "local-task-item--completed" : "",
              selected ? "local-task-item--viewing" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(taskStep)}
          >
            <span className="local-task-item__left">
              <span className="local-task-item__status">
                {done ? "✓" : active ? "●" : "○"}
              </span>
              <span className="local-task-item__title">
                {taskStep}. {label}
              </span>
            </span>
            <span className="local-task-item__badge">
              {done ? "完了" : active ? "RUNNING" : "待機"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function StepOne({
  onCopy,
  onNext,
}: {
  onCopy: (value: string) => void;
  onNext: () => void;
}) {
  const command = "pnpm clasp login";

  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 1 / ${totalSteps}`}
        title="Google Account Authentication"
        description={
          <>
            Run Google authentication for <InlineCode>@google/clasp</InlineCode>{" "}
            on your local machine.
          </>
        }
      />

      <CommandBlock value={command} onCopy={() => onCopy(command)} />

      <InfoBox>
        Running this command opens your browser and shows the Google
        authentication screen. Log in with the account you will use for GAS.
      </InfoBox>

      <WizardFooter>
        <span className="footer-status">
          <span className="status-dot status-dot--orange" />
          Creates ~/.clasprc.json
        </span>

        <PrimaryButton onClick={onNext}>
          Authentication complete
          <span>→</span>
        </PrimaryButton>
      </WizardFooter>
    </section>
  );
}

function StepThree({
  setupMode,
  onSetupModeChange,
  scriptId,
  claspJson,
  oneLiner,
  onScriptIdChange,
  onPaste,
  onClear,
  onCopy,
  onBack,
  onNext,
}: {
  setupMode: SetupMode;
  onSetupModeChange: (mode: SetupMode) => void;
  scriptId: string;
  claspJson: string;
  oneLiner: string;
  onScriptIdChange: (value: string) => void;
  onPaste: () => void;
  onClear: () => void;
  onCopy: (value: string, message?: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = setupMode === "new" || scriptId.trim().length > 5;

  const createCommand =
    'pnpm clasp create --type standalone --title "gasboost-app"';

  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 3 / ${totalSteps}`}
        title="Connect an Apps Script Project"
        description="Create a new Apps Script project or connect to an existing project."
      />

      <div className="setup-mode">
        <button
          type="button"
          className={[
            "setup-mode__button",
            setupMode === "new" ? "setup-mode__button--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSetupModeChange("new")}
        >
          <strong>Create new</strong>
          <span>Create and connect a new Apps Script project.</span>
        </button>

        <button
          type="button"
          className={[
            "setup-mode__button",
            setupMode === "existing" ? "setup-mode__button--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSetupModeChange("existing")}
        >
          <strong>Connect existing project</strong>
          <span>Use the Script ID of an existing Apps Script project.</span>
        </button>
      </div>

      {setupMode === "new" ? (
        <>
          <InfoBox>
            Run the following command from the project root. It creates a new
            Apps Script project and <InlineCode>.clasp.json</InlineCode>.
          </InfoBox>

          <CommandBlock
            value={createCommand}
            onCopy={() =>
              onCopy(createCommand, "Copied the clasp create command")
            }
          />

          <div className="create-result">
            <span className="status-dot status-dot--healthy" />

            <div>
              <strong>.clasp.json will be created</strong>
              <p>After running the command, continue to the next step.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <InfoBox>
            <InlineCode>clasp clone</InlineCode> is not required. Create{" "}
            <InlineCode>.clasp.json</InlineCode> while keeping the current
            project structure.
          </InfoBox>

          <div className="field">
            <div className="field__header">
              <label htmlFor="script-id" className="field__label">
                Apps Script Script ID
                <span className="required">*</span>
              </label>

              <a
                href={`https://script.google.com/u/0/home/projects/${scriptId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="external-link"
              >
                Open GAS Editor ↗
              </a>
            </div>

            <div className="script-input">
              <input
                id="script-id"
                value={scriptId}
                onChange={(event) => onScriptIdChange(event.target.value)}
                placeholder="1BxImVS0XRA5nFMdKvBdBZjgmlUqptlbs..."
              />

              <div className="script-input__actions">
                <button type="button" onClick={onPaste}>
                  Paste
                </button>

                <button
                  type="button"
                  onClick={onClear}
                  aria-label="Clear Script ID"
                >
                  ×
                </button>
              </div>
            </div>

            <p className="field__help">
              Copy it from Project Settings → Script ID in the GAS editor.
            </p>
          </div>

          <div className="preview">
            <div className="preview__heading">
              <span>
                Generated <InlineCode>.clasp.json</InlineCode>
              </span>

              <button
                type="button"
                className="copy-button"
                onClick={() => onCopy(claspJson, "Copied .clasp.json")}
              >
                Copy
              </button>
            </div>

            <CodeBlock
              filename=".clasp.json"
              badge="rootDir: ./dist"
              value={claspJson}
            />
          </div>

          <div className="preview">
            <div className="preview__heading">
              <span>Terminal one-liner</span>

              <button
                type="button"
                className="copy-button"
                onClick={() => onCopy(oneLiner, "Copied command")}
              >
                Copy
              </button>
            </div>

            <CodeBlock value={oneLiner} />
          </div>
        </>
      )}

      <WizardFooter>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>

        <div className="wizard__actions">
          {setupMode === "existing" && (
            <span
              className={["clasp-status", valid ? "clasp-status--ready" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                className={
                  valid ? "status-dot status-dot--healthy" : "status-dot"
                }
              />

              {valid ? ".clasp.json is ready" : "Enter the Script ID"}
            </span>
          )}

          <PrimaryButton onClick={onNext} disabled={!valid}>
            Next
            <span>→</span>
          </PrimaryButton>
        </div>
      </WizardFooter>
    </section>
  );
}

function StepTwo({
  checked,
  onCheckedChange,
  onBack,
  onNext,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 2 / ${totalSteps} — Required`}
        title="Enable the Google Apps Script API"
        description="Enable the Google Apps Script API so your local environment can access Apps Script."
        accent="orange"
      />

      <div className="api-actions">
        <a
          href="https://script.google.com/home/usersettings"
          target="_blank"
          rel="noreferrer"
          className="external-button"
        >
          Open Google Apps Script User Settings ↗
        </a>

        <label className="checkbox-card">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
          />

          <span>I turned on Google Apps Script API</span>
        </label>
      </div>

      <WizardFooter>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!checked}>
          Confirm API enabled
          <span>→</span>
        </PrimaryButton>
      </WizardFooter>
    </section>
  );
}

function StepFour({
  firebaseProjectName,
  onFirebaseProjectNameChange,
  onBack,
  onNext,
}: {
  firebaseProjectName: string;
  onFirebaseProjectNameChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid = firebaseProjectName.trim().length > 0;

  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 4 / ${totalSteps}`}
        title="Create a Firebase Project and App"
        description="Firebaseプロジェクトを作成し、このアプリで利用するWebアプリを追加します。"
        accent="orange"
      />

      <div className="firebase-steps">
        <div className="firebase-card">
          <span className="firebase-card__number">1</span>
          <div>
            <strong>Firebaseプロジェクトを作成</strong>
            <p>
              プロジェクト作成後、プロジェクトIDを下に入力してください。作成フローでは
              Google Analytics をオフにしてください。
            </p>
          </div>
        </div>

        <div className="firebase-card">
          <span className="firebase-card__number">2</span>
          <div>
            <strong>Webアプリを追加</strong>
            <p>
              設定 → 全般 → マイアプリからWebアプリを追加します。Firebase
              Hosting の設定はオフにしてください。
            </p>
          </div>
        </div>

        <div className="firebase-card">
          <span className="firebase-card__number">3</span>
          <div>
            <strong>Realtime Databaseを作成</strong>
            <p>ビルド → Realtime Database からデータベースを作成します。</p>
          </div>
        </div>
      </div>

      <a
        href="https://console.firebase.google.com/"
        target="_blank"
        rel="noreferrer"
        className="external-button"
      >
        Open Firebase Console ↗
      </a>

      <div className="field">
        <label htmlFor="firebase-project-name" className="field__label">
          Firebase project name
          <span className="required">*</span>
        </label>

        <input
          id="firebase-project-name"
          value={firebaseProjectName}
          onChange={(event) => onFirebaseProjectNameChange(event.target.value)}
          placeholder="my-firebase-project"
        />

        <p className="field__help">
          Firebase
          Consoleのプロジェクト設定に表示されるプロジェクトIDを入力してください。
        </p>
      </div>

      <WizardFooter>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!valid}>
          Firebase project is ready
          <span>→</span>
        </PrimaryButton>
      </WizardFooter>
    </section>
  );
}

function StepFive({
  firebaseSdkCode,
  firebaseProjectName,
  setupCommand,
  onFirebaseSdkCodeChange,
  onCopy,
  onBack,
  onNext,
}: {
  firebaseSdkCode: string;
  firebaseProjectName: string;
  setupCommand: string;
  onFirebaseSdkCodeChange: (value: string) => void;
  onCopy: (value: string, message?: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const valid =
    firebaseProjectName.trim().length > 0 && firebaseSdkCode.trim().length > 0;

  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 5 / ${totalSteps}`}
        title="Set Up Firebase SDK and Realtime Database"
        description={
          <>
            FirebaseからコピーしたSDK設定コードを入力し、ローカル環境へ一括で設定します。
          </>
        }
      />

      <div className="field">
        <label htmlFor="firebase-sdk-code" className="field__label">
          Firebase SDK setup code
          <span className="required">*</span>
        </label>
        <textarea
          id="firebase-sdk-code"
          className="firebase-sdk-input"
          value={firebaseSdkCode}
          onChange={(event) => onFirebaseSdkCodeChange(event.target.value)}
          placeholder={`import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "..."
};

export const firebaseApp = initializeApp(firebaseConfig);`}
        />
        <p className="field__help">
          Firebase Consoleの「設定 → 全般 → マイアプリ →
          SDKの設定と構成」からコピーしてください。
        </p>
      </div>

      <InfoBox>
        このコマンドは <InlineCode>VITE_FIREBASE_PROJECT_NAME</InlineCode> を{" "}
        <InlineCode>.env</InlineCode> に保存し、Firebase SDKの追加、
        <InlineCode>src/frontend/lib/firebase.ts</InlineCode> の作成、Realtime
        Database Rulesの生成とデプロイをまとめて実行します。
      </InfoBox>

      <div className="preview">
        <div className="preview__heading">
          <span>Firebase setup command</span>
          <button
            type="button"
            className="copy-button"
            onClick={() =>
              onCopy(setupCommand, "Copied Firebase setup command")
            }
          >
            Copy
          </button>
        </div>
        <CodeBlock
          filename="terminal"
          badge="SDK + RTDB"
          value={setupCommand}
        />
      </div>

      <WizardFooter>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>

        <PrimaryButton onClick={onNext} disabled={!valid}>
          Firebase setup complete
          <span>→</span>
        </PrimaryButton>
      </WizardFooter>
    </section>
  );
}

function StepSix({
  onCopy,
  onBack,
  onFinish,
}: {
  onCopy: (value: string, message?: string) => void;
  onBack: () => void;
  onFinish: () => void;
}) {
  return (
    <section className="wizard__section">
      <StepHeading
        step={`Step 6 / ${totalSteps} — Final step`}
        title="Initial Build & Deploy"
        description="Build the gasboost app and deploy it to the connected Apps Script project with Firebase settings."
        accent="healthy"
      />

      <CommandBlock
        value="pnpm deploy"
        onCopy={() => onCopy("pnpm deploy", "Copied the deploy command")}
      />

      <div className="open-editor">
        <span>Check the GAS editor after deployment:</span>

        <button
          type="button"
          onClick={() =>
            onCopy("pnpm clasp open", "Copied the clasp open command")
          }
        >
          pnpm clasp open
        </button>
      </div>

      <WizardFooter>
        <SecondaryButton onClick={onBack}>← Back</SecondaryButton>

        <PrimaryButton onClick={onFinish}>
          Finish setup
          <span>→</span>
        </PrimaryButton>
      </WizardFooter>
    </section>
  );
}

function StepHeading({
  step,
  title,
  description,
  accent = "primary",
}: {
  step: string;
  title: string;
  description: React.ReactNode;
  accent?: "primary" | "orange" | "healthy";
}) {
  return (
    <header className="step-heading">
      <span className={`step-heading__step step-heading__step--${accent}`}>
        {step}
      </span>

      <h1>{title}</h1>

      <div className="step-heading__description">{description}</div>
    </header>
  );
}

function CommandBlock({
  value,
  onCopy,
}: {
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="command">
      <div className="command__header">
        <span>⌘ terminal</span>

        <button type="button" onClick={onCopy}>
          Copy
        </button>
      </div>

      <div className="command__body">
        <code>{value}</code>
      </div>
    </div>
  );
}

function CodeBlock({
  filename,
  badge,
  value,
}: {
  filename?: string;
  badge?: string;
  value: string;
}) {
  return (
    <div className="code-block">
      {(filename || badge) && (
        <div className="code-block__header">
          <span>{filename}</span>
          <span className="code-block__badge">{badge}</span>
        </div>
      )}

      <pre>
        <code>{value}</code>
      </pre>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="info-box">
      <span className="info-box__icon">i</span>
      <div>{children}</div>
    </div>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="inline-code">{children}</code>;
}

function WizardFooter({ children }: { children: React.ReactNode }) {
  return <footer className="wizard__footer">{children}</footer>;
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="button button--primary"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="button button--secondary"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="toast">
      <span>✓</span>
      {message}
    </div>
  );
}

function Footer({ onSkip }: { onSkip: () => void }) {
  return (
    <footer className="page-footer">
      <div className="page-footer__inner">
        <span>gasboost • TypeScript Apps Script Runtime</span>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { template } from "./lib/appsscript";
import "./RemoteSetupTutorial.css";

type TaskId = 0 | 1 | 2 | 3;

const tasks = [
  "初期セットアップ",
  "アカウント作成",
  "ローカルDB同期",
  "変更をデプロイ",
] as const;

const ssUrl = `https://docs.google.com/spreadsheets/d/${template.dbId}/edit`;
const firebaseProjectName =
  import.meta.env.VITE_FIREBASE_PROJECT_NAME || "Not configured";

export function RemoteSetupTutorial() {
  const [completed, setCompleted] = useState(0);
  const [viewing, setViewing] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const finish = (step: TaskId) => {
    if (processing) return;
    setProcessing(true);
    window.setTimeout(
      () => {
        if (completed === step) setCompleted(step + 1);
        setViewing(Math.min(step + 1, tasks.length));
        setProcessing(false);
      },
      step === 0 ? 400 : 350,
    );
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToast("クリップボードにコピーしました");
    } catch {
      setToast("コピーに失敗しました");
    }
    window.setTimeout(() => setToast(null), 1800);
  };

  const reset = () => {
    setCompleted(0);
    setViewing(0);
  };

  return (
    <div className="remote-setup">
      {toast && <div className="remote-toast">{toast}</div>}
      <Header />

      <main className="remote-main">
        <div className="remote-shell">
          <section className="remote-context">
            <div>
              <div className="eyebrow">SEQUENTIAL DEPLOYMENT WORKFLOW</div>
              <h1>チュートリアル</h1>
            </div>
            <div className="progress-badge">
              進捗:{" "}
              <strong>
                {completed} / {tasks.length} 完了
              </strong>
            </div>
          </section>

          <div className="remote-grid">
            <aside className="task-rail">
              <div className="task-rail__header">
                <span>✓ WORKFLOW TASKS</span>
                <span className="rail-chip">順次実行</span>
              </div>

              <nav className="task-list" aria-label="Workflow Outline">
                {tasks.map((title, index) => {
                  const done = index < completed;
                  const active = index === completed;
                  const selected = index === viewing;
                  return (
                    <button
                      key={title}
                      type="button"
                      className={`task-rail-item ${done ? "task-rail-item--completed" : ""} ${active ? "task-rail-item--active" : ""} ${selected ? "task-rail-item--viewing" : ""}`}
                      onClick={() => setViewing(index)}
                    >
                      <span className="task-rail-item__left">
                        <span className="task-rail-item__status">
                          {done ? "✓" : active ? "●" : "🔒"}
                        </span>
                        <span className="task-rail-item__title">
                          {index}. {title}
                        </span>
                      </span>
                      <span className="task-rail-item__badge">
                        {done ? "完了" : active ? "RUNNING" : "待機"}
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="rail-progress">
                <span>進行ステータス</span>
                <span>
                  進捗:{" "}
                  <strong>
                    {completed} / {tasks.length} 完了
                  </strong>
                </span>
              </div>

              <DbMonitor
                connected={completed > 0}
                firebaseProjectName={firebaseProjectName}
              />
            </aside>

            <section className="task-panel" aria-live="polite">
              <div
                className={`task-card ${processing ? "task-card--processing" : ""}`}
              >
                {completed >= tasks.length && viewing >= tasks.length ? (
                  <CompletedState onReset={reset} />
                ) : (
                  <TaskView
                    step={viewing as TaskId}
                    completed={completed}
                    onFinish={finish}
                    onCopy={copy}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="remote-header">
      <div className="remote-header__inner">
        <div className="remote-brand">
          <div className="remote-brand__logo">⚡</div>
          <div className="remote-brand__text">
            <strong>gasboost</strong>
            <span>Remote Setup</span>
          </div>
        </div>
        <div className="live-status">
          <span className="live-dot">
            <span className="live-dot__pulse" />
            <span className="live-dot__core" />
          </span>
          <strong>GAS Web App · Live</strong>
          <span className="live-status__separator">•</span>
          <span className="live-status__runtime">V8 Runtime</span>
        </div>
      </div>
    </header>
  );
}

function DbMonitor({
  connected,
  firebaseProjectName,
}: {
  connected: boolean;
  firebaseProjectName: string;
}) {
  return (
    <div className="db-monitor">
      <div className="db-monitor__header">
        <strong>DB MONITOR</strong>
        <button type="button" onClick={() => window.open(ssUrl, "_blank")}>
          Open Database ↗
        </button>
      </div>
      {connected ? (
        <div className="db-monitor__content">
          <div className="db-monitor__connection">
            <span>
              <i className="status-dot status-dot--green" />
              Connected DB
            </span>
            <span>Spreadsheet API v4</span>
          </div>
          <div className="db-monitor__details">
            <DetailRow label="SHEET:" value={template.sheetName} />
            <DetailRow label="STATUS:" value="Active (Ready)" accent="green" />
            <DetailRow
              label="FIREBASE:"
              value={firebaseProjectName}
              accent="cyan"
            />
            <DetailRow label="TABLES:" value={template.schema} accent="cyan" />
          </div>
        </div>
      ) : (
        <div className="db-monitor__content">
          <div className="db-monitor__connection db-monitor__connection--off">
            <span>
              <i className="status-dot status-dot--red" />
              Unconnected DB
            </span>
            <span>Step 0 実行待ち</span>
          </div>
          <p>
            初期セットアップを実行するとスプレッドシートORMが作成され接続されます。
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "green" | "cyan";
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <span className={accent ? `text-${accent}` : ""}>{value}</span>
    </div>
  );
}

function TaskView({
  step,
  completed,
  onFinish,
  onCopy,
}: {
  step: TaskId;
  completed: number;
  onFinish: (step: TaskId) => void;
  onCopy: (value: string) => void;
}) {
  if (step === 0)
    return (
      <InitialSetup completed={completed > 0} onFinish={() => onFinish(0)} />
    );
  if (step === 1)
    return (
      <AccountSetup completed={completed > 1} onFinish={() => onFinish(1)} />
    );
  if (step === 2)
    return (
      <ReplicaSync completed={completed > 2} onFinish={() => onFinish(2)} />
    );
  return (
    <Deploy
      completed={completed > 3}
      onFinish={() => onFinish(3)}
      onCopy={onCopy}
    />
  );
}

function TaskHeader({
  step,
  title,
  description,
  completed,
}: {
  step: number;
  title: string;
  description: React.ReactNode;
  completed: boolean;
}) {
  return (
    <div>
      <div className="task-status-row">
        <span>CURRENT ACTIVE TASK · STEP {step}</span>
        <span
          className={`task-state ${completed ? "task-state--completed" : "task-state--running"}`}
        >
          {completed ? "✓ COMPLETED" : "● IN PROGRESS"}
        </span>
      </div>
      <h2>
        {step}. {title}
      </h2>
      <p className="task-description">{description}</p>
    </div>
  );
}

function InitialSetup({
  completed,
  onFinish,
}: {
  completed: boolean;
  onFinish: () => void;
}) {
  return (
    <>
      <div>
        <TaskHeader
          step={0}
          title="初期セットアップ"
          description="データベース（Google Sheets）の初期化、初期タスクをプロビジョニングします。"
          completed={completed}
        />
        <div className="terminal-card">
          <DetailRow label="TARGET DB:" value={ssUrl} accent="cyan" />
          <DetailRow
            label="TABLES:"
            value={template.schema}
            accent={completed ? "green" : undefined}
          />
        </div>
      </div>
      <TaskFooter note="">
        <PrimaryButton onClick={onFinish}>
          ▶ 初期セットアップを実行
        </PrimaryButton>
      </TaskFooter>
    </>
  );
}

function AccountSetup({
  completed,
  onFinish,
}: {
  completed: boolean;
  onFinish: () => void;
}) {
  const [name, setName] = useState("admin_core");
  const [email, setEmail] = useState("admin@example.com");
  return (
    <>
      <div>
        <TaskHeader
          step={1}
          title="アカウント作成"
          description="管理者ユーザーの基本情報を設定します。認証情報はGoogle Apps Scriptランタイムと同期されます。"
          completed={completed}
        />
        <div className="form-stack">
          <Field
            label="ユーザー名 / DISPLAY NAME"
            value={name}
            onChange={setName}
            type="text"
          />
          <Field
            label="メールアドレス / EMAIL ADDRESS"
            value={email}
            onChange={setEmail}
            type="email"
          />
          <div className="info-grid">
            <InfoTile
              label="認証方法 (AUTH)"
              value="Default GAS"
              badge="固定"
            />
            <InfoTile
              label="SESSION STORAGE"
              value="Apps Script Cache"
              badge="CacheService"
              accent
            />
          </div>
        </div>
      </div>
      <TaskFooter note="※ユーザー情報はスプレッドシートの管理者テーブルに書き込まれます。">
        <PrimaryButton onClick={onFinish}>＋ アカウントを作成</PrimaryButton>
      </TaskFooter>
    </>
  );
}

function ReplicaSync({
  completed,
  onFinish,
}: {
  completed: boolean;
  onFinish: () => void;
}) {
  return (
    <>
      <div>
        <TaskHeader
          step={2}
          title="ローカルDB同期"
          description="ローカル端末とスプレッドシートのデータを同期します。"
          completed={completed}
        />
        <div className="sync-card">
          <div className="sync-card__icon">↻</div>
          <p>Remote SheetORM ⟷ Local Schema Cache</p>
        </div>
      </div>
      <TaskFooter note="※最新の差分データをフェッチして同期を完了させます。">
        <PrimaryButton onClick={onFinish}>↻ 同期を開始</PrimaryButton>
      </TaskFooter>
    </>
  );
}

function Deploy({
  completed,
  onFinish,
  onCopy,
}: {
  completed: boolean;
  onFinish: () => void;
  onCopy: (value: string) => void;
}) {
  return (
    <>
      <div>
        <TaskHeader
          step={3}
          title="変更をデプロイ"
          description="ターミナルで本番デプロイコマンドを実行してください。"
          completed={completed}
        />
        <CodeAction
          label="デプロイコマンド"
          value="pnpm deploy"
          onCopy={() => onCopy("pnpm deploy")}
        />
      </div>
      <TaskFooter note="※デプロイが完了したら下のボタンを押してください。">
        <PrimaryButton onClick={onFinish}>☁ デプロイ完了</PrimaryButton>
      </TaskFooter>
    </>
  );
}

function CompletedState({ onReset }: { onReset: () => void }) {
  return (
    <div className="completed-state">
      <div className="completed-state__icon">✓</div>
      <div>
        <h2>All tasks completed. Your gasboost app is ready.</h2>
        <p>
          すべてのセットアップが完了しました。Google Apps
          Script連携が正常に動作しています。
        </p>
      </div>
      <div className="completed-state__actions">
        <button type="button" className="secondary-button" onClick={onReset}>
          初めから再設定する
        </button>
        <button type="button" className="primary-button">
          ダッシュボードを開く →
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function InfoTile({
  label,
  value,
  badge,
  accent = false,
}: {
  label: string;
  value: string;
  badge: string;
  accent?: boolean;
}) {
  return (
    <div className="info-tile">
      <div>
        <span>{label}</span>
        <strong className={accent ? "text-cyan" : ""}>{value}</strong>
      </div>
      <small>{badge}</small>
    </div>
  );
}

function CodeAction({
  label,
  value,
  onCopy,
  multiline = false,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="code-action">
      <div className="code-action__header">
        <span>{label}</span>
        <button type="button" onClick={onCopy}>
          コピー
        </button>
      </div>
      {multiline ? (
        <pre>
          <code>{value}</code>
        </pre>
      ) : (
        <div className="code-action__line">
          <code>$ {value}</code>
        </div>
      )}
    </div>
  );
}

function TaskFooter({
  note,
  children,
}: {
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="task-footer">
      <p>{note}</p>
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="primary-button" onClick={onClick}>
      {children}
    </button>
  );
}

function Footer() {
  return (
    <footer className="remote-footer">
      <div className="remote-footer__inner">
        <div>
          <strong>gasboost v2.4.0</strong>
          <span>•</span>
          <span>TypeScript Apps Script Runtime</span>
        </div>
        <div className="remote-footer__links">
          <a
            href="https://github.com/gasboost"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <a href="#">Bridge Logs</a>
          <a href="#">Documentation</a>
        </div>
      </div>
    </footer>
  );
}

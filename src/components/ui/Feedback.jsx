export default function Feedback({ message }) {
  return (
    <>
      <div role="status">{message?.kind === 'success' && <p className="ui-feedback ui-feedback--success">{message.text}</p>}</div>
      <div role="alert">{message?.kind === 'error' && <p className="ui-feedback ui-feedback--error">{message.text}</p>}</div>
    </>
  );
}

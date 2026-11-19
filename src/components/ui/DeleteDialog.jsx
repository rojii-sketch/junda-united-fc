import Modal from './Modal';

export default function DeleteDialog({ request, onCancel }) {
  if (!request) return null;

  return (
    <Modal className="ui-confirm" label="Confirm deletion" descriptionId="delete-dialog-question" onClose={onCancel}>
      <h2>Confirm deletion</h2>
      <p id="delete-dialog-question">{request.question}</p>
      <div className="ui-confirm__actions">
        <button className="edit-btn" type="button" onClick={onCancel}>Cancel</button>
        <button className="delete-btn" type="button" onClick={() => { onCancel(); request.run(); }}>Delete</button>
      </div>
    </Modal>
  );
}

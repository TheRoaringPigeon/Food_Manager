import Button from "./Button";
import Card from "./Card";
import styles from "./Modal.module.css";

const Modal = (props) => {
  return (
    <div>
      <div className={styles.backdrop} />
      <Card className={styles.modal}>
        <header className={styles.header}>
          <h2>{props.title}</h2>
        </header>
        <div className={styles.content}>
          <p>{props.message}</p>
        </div>
        {props.modalType === "errorModal" && (
          <footer className={styles.actions}>
            <Button onClick={props.onClick}>I'll take another look.</Button>
          </footer>
        )}
        {props.modalType === "recipeConfirmationModal" && (
          <footer className={styles.actions}>
            <Button onClick={props.onCancel}>Let me double check.</Button>
            <Button onClick={props.onClick}>I'm ready!</Button>
          </footer>
        )}
      </Card>
    </div>
  );
};
export default Modal;

import Card from "../ui/Card";
import styles from "./Ingredient.module.css";
function Ingredient(props) {
  return (
    <li>
      <Card>
        <div className={styles.content}>
          <span>{props.name}</span>
          <span>{`${props.amount} ${props.measurement}`}</span>
        </div>
      </Card>
    </li>
  );
}

export default Ingredient;

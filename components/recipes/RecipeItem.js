import { useRouter } from "next/router";
import Card from '../ui/Card';
import styles from './RecipeItem.module.css';

function RecipeItem(props) {
    const router = useRouter();
    function showDetailsHandler() {
        router.push('/' + props.id);
    }
    return (
        <li className={styles.item}>
            <Card>
                <div className={styles.image}>
                    <img src={props.image} alt={props.id} />
                </div>
                <div className={styles.content}>
                    <h3>{props.id}</h3>
                    <address>{props.description}</address>
                </div>
                <div className={styles.actions}>
                    <button onClick={showDetailsHandler}>View Recipe</button>
                </div>
            </Card>
        </li>
    )
}

export default RecipeItem;
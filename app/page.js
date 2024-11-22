import styles from "./page.module.css";
import Container from "../components/Container";


export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>       
        <Container/>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}

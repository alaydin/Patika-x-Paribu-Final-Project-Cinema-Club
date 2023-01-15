import Link from 'next/link';
import styles from "./Navbar.module.css";

function MyNavbar() {
    return (
        <nav className={styles.nav}>
            <Link href="/">
                <button className={styles.navLink}>Home</button>
            </Link>
            <Link href="/cinema">
                <button className={styles.navLink}>Cinema</button>
            </Link>
            <Link href="/management">
                <button className={styles.navLink}>Management</button>
            </Link>
        </nav>
    );
}

export default MyNavbar;

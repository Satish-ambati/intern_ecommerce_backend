// Footer.jsx - Simple footer shown at the bottom of every page

function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        © 2024 E-Commerce Store | Built with React + Spring Boot
      </p>
      <p style={styles.subText}>
        Backend runs on: http://localhost:8080 | Frontend runs on: http://localhost:5173
      </p>
    </footer>
  )
}

const styles = {
  footer: {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    textAlign: 'center',
    padding: '20px',
    marginTop: '40px'
  },
  text: {
    fontSize: '14px',
    marginBottom: '5px'
  },
  subText: {
    fontSize: '12px',
    color: '#95a5a6'
  }
}

export default Footer

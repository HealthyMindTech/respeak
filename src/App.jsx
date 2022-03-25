import {Navbar, ThemeProvider, Row, Col, Container } from 'react-bootstrap';

function App() {
  return (
    
    <ThemeProvider>
      <Navbar bg="light">
        <Container>
          <Navbar.Brand href="#home">Respeak</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col xs={3} />
          <Col xs={6}>Hello there</Col>
          <Col xs={3} />
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default App;

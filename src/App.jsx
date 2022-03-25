import {ThemeProvider, Row, Col, Container } from 'react-bootstrap';

function App() {
  return (
    <ThemeProvider>
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

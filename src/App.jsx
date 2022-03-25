import { Button, Navbar, Form, ThemeProvider, Row, Col, Container } from 'react-bootstrap';

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
          <Col xs={6}>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Please write down your thoughts: </Form.Label>
                <Form.Control as="textarea" rows={5} />
              </Form.Group>
              <Button variant="primary" type="submit">
                Pass thoughts to the great void
              </Button>
            </Form>
          </Col>
          <Col xs={3} />
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default App;

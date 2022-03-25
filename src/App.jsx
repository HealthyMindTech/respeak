import React, { useState } from "react";
import {Navbar, ThemeProvider, Row, Col, Container, Modal, Button, Form} from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';
import Image from 'react-bootstrap/Image';
import BgImage from '../src/assets/img/Thoughts.png'

function InfoDialog() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="outline" onClick={handleShow}>
        <QuestionCircle />
      </Button>

      <Modal show={show} onHide={handleClose} scrollable="true">
        <Modal.Header closeButton>
          <Modal.Title>Respeak</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share your thoughts and help others reframe theirs.</p>
          <p>Write down what thoughts are burdening you at the moment, and click SEND. </p>
          <p>Afterward, help others reframe their thoughts. Can you find a different 
          perspective for their challenge? </p>
          {/* <p>For every 2 thoughts that you help reframe, you get one of your thoughts reframed. 
          And you can inspect the history of all the thoughts.</p> */}
          <hr></hr>
          <p>Example</p>
          <p>Thought:</p>
          <p><i>“I failed the math test today and I feel useless and so stupid.”</i></p>
          <p>Try to rephrase this. For example other people will help you rephrase it 
            with other perspectives:</p>
          <p><i>“I have not prepared enough for the math test. I have gone through many tests in my 
            life and succeeded. Next time I can prepare better. ”</i></p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function ThoughtsForm() {
  return(
    <Form>
    <Form.Group className="mb-3" controlId="formBasicThought">
      <Form.Label>What's on your mind?</Form.Label>
      <Form.Control as="textarea" placeholder="Enter thoughts here" rows="3" />
      <Form.Text className="text-muted">
        Hint: Just share what's burdening you atm. 
      </Form.Text>
    </Form.Group>
    <Button variant="primary" type="submit">
      SEND
    </Button>
  </Form>
);
}


function App() {
  return (
    
    <ThemeProvider>
      <Navbar bg="light">
        <Container>
          <Navbar.Brand href="#home">Respeak</Navbar.Brand>
          <InfoDialog />
        </Container>
      </Navbar>
      <Image src={BgImage} className='img-fluid w-100' alt='...' />
      <Container>
        <Row>
          <Col xs={3} />
          <Col xs={6}>
          <br></br>
          <ThoughtsForm/>
          </Col>
          <Col xs={3} />
        </Row>
      </Container>
    </ThemeProvider>
  );
}

export default App;

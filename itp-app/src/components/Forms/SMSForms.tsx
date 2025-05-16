import { ChangeEvent, Component, FormEvent } from 'react';
import './SMSForm.css';

interface Message {
  to: string;
  body: string;
}

interface SMSFormState {
  message: Message;
  submitting: boolean;
  error: boolean;
  success: boolean;
}

class SMSForm extends Component<{}, SMSFormState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      message: {
        to: '',
        body: ''
      },
      submitting: false,
      error: false,
      success: false
    };

    this.onHandleChange = this.onHandleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onHandleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const name = event.target.name as keyof Message;
    this.setState({
      message: {
        ...this.state.message,
        [name]: event.target.value
      }
    });
  }

  onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { to, body } = this.state.message;

    if (!to || !body) {
      this.setState({ error: true, success: false });
      return;
    }

    this.setState({ submitting: true, error: false, success: false });

    fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: 'receiverPhoneNumber',
          body: 'Your message'
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.error(err);
      });
      
  }

  render() {
    const { message, submitting, error, success } = this.state;

    return (
      <form
        onSubmit={this.onSubmit}
        className={error ? 'error sms-form' : 'sms-form'}
      >
        <div>
          <label htmlFor="to">To:</label>
          <input
            type="tel"
            name="to"
            id="to"
            value={message.to}
            onChange={this.onHandleChange}
            placeholder="+1234567890"
            required
          />
        </div>
        <div>
          <label htmlFor="body">Body:</label>
          <textarea
            name="body"
            id="body"
            value={message.body}
            onChange={this.onHandleChange}
            placeholder="Your message..."
            required
          />
        </div>

        {error && <div className="error-message">❌ Failed to send message.</div>}
        {success && <div className="success-message">✅ Message sent!</div>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send message'}
        </button>
      </form>
    );
  }
}

export default SMSForm;

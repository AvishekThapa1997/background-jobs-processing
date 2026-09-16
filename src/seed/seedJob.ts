const baseUrl = 'http://localhost:3000/jobs';

const totalJobs = 12;

async function createJobs() {
  for (let i = 1; i <= totalJobs; i++) {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'SEND_EMAIL',
        payload: {
          to: `test-${i}@example.com`,
          template: 'WELCOME_EMAIL',
        },
      }),
    });

    const result = await response.json();
  }
}

createJobs().then(() => console.log('All Job inserted'));

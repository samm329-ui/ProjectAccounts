import mockData from './mock-data.json';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getSummary() {
    await delay(500);
    return mockData.summary;
}

export async function getClients() {
    await delay(300);
    return mockData.clients;
}

export async function getPayments() {
    await delay(400);
    return mockData.payments;
}

export async function getLogs() {
    await delay(200);
    return mockData.logs;
}

export async function getTeamLedger(memberId: string) {
    await delay(300);
    // In a real app, you'd filter by memberId
    return mockData.teamLedger;
}

// Cierre de votaciones: miércoles 10 jun 2026 a las 18:00 hora México (CDT = UTC-5)
export const VOTING_DEADLINE = new Date('2026-06-10T18:00:00-05:00');

export const votingIsClosed = () => new Date() >= VOTING_DEADLINE;

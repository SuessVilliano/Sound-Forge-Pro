
import { Proposal } from '../types';

const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 'prop_1',
        title: 'Increase Royalty Split for Pro Users',
        description: 'Proposal to increase the artist revenue share for Pro tier users from 90% to 95% on direct sales through the SoundForge marketplace.',
        category: 'Royalty Split',
        status: 'active',
        votesFor: 125000,
        votesAgainst: 15000,
        deadline: '2025-06-15T00:00:00Z',
        author: 'SoundForge Governance'
    },
    {
        id: 'prop_2',
        title: 'Integrate Polygon for Lower Fees',
        description: 'Add support for the Polygon network alongside Solana for minting Voice NFTs to provide more options for gas fee optimization.',
        category: 'Feature',
        status: 'active',
        votesFor: 85000,
        votesAgainst: 92000,
        deadline: '2025-06-20T00:00:00Z',
        author: 'Community Dev'
    },
    {
        id: 'prop_3',
        title: 'Launch "Beat Market" Feature',
        description: 'Develop a dedicated marketplace section for producers to sell beats directly to other artists within the ecosystem.',
        category: 'Feature',
        status: 'passed',
        votesFor: 450000,
        votesAgainst: 20000,
        deadline: '2025-05-01T00:00:00Z',
        author: 'Top Producer DAO'
    }
];

export const daoService = {
    getProposals: async (): Promise<Proposal[]> => {
        // Simulate fetch delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_PROPOSALS;
    },

    castVote: async (proposalId: string, vote: 'for' | 'against', votingPower: number): Promise<{ success: boolean }> => {
        // Simulate blockchain transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Voted ${vote} on proposal ${proposalId} with power ${votingPower}`);
        return { success: true };
    },

    calculateVotingPower: (xp: number, earnings: number): number => {
        // Simple formula: 1 XP = 1 Power, $1 Earning = 10 Power
        return Math.floor(xp + (earnings * 10));
    }
};

/**
 * SOUND FORGE PRO - PUBLISHING HEALTH DASHBOARD
 * Visual audit of publishing setup with actionable recommendations
 */

import React, { useState, useEffect } from 'react';
import {
    Shield, AlertTriangle, CheckCircle2, XCircle, ExternalLink,
    DollarSign, FileText, Music, Building2, Loader2, RefreshCw,
    ChevronRight, TrendingUp, Search, Globe, Zap, ArrowRight
} from 'lucide-react';
import { User, Track } from '../types';
import { publishingHealthService, PublishingHealthReport } from '../services/publishingHealthService';
import { revenueRecoveryService, REVENUE_SOURCES } from '../services/revenueRecoveryService';
import { PERFORMANCE_RIGHTS_ORGS } from '../services/proIntegrationService';
import { mlcService } from '../services/mlcService';

interface PublishingHealthProps {
    user: User;
    tracks: Track[];
}

export const PublishingHealth: React.FC<PublishingHealthProps> = ({ user, tracks }) => {
    const [report, setReport] = useState<PublishingHealthReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'pro' | 'mlc' | 'recovery'>('overview');
    const [publishingInfo, setPublishingInfo] = useState({
        proMembership: { pro: '', memberId: '' },
        mlcRegistered: false,
        hasPublisher: false,
        publisherName: ''
    });

    const runAudit = async () => {
        setLoading(true);
        try {
            const healthReport = await publishingHealthService.runHealthCheck(
                user,
                tracks,
                publishingInfo.proMembership.pro ? publishingInfo : undefined
            );
            setReport(healthReport);
        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runAudit();
    }, []);

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            'A': 'text-green-500',
            'B': 'text-blue-500',
            'C': 'text-yellow-500',
            'D': 'text-orange-500',
            'F': 'text-red-500'
        };
        return colors[grade] || 'text-slate-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pass':
            case 'healthy':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'fail':
            case 'critical':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <FileText className="w-4 h-4 text-slate-400" />;
        }
    };

    const searchUrls = revenueRecoveryService.generateSearchUrls(
        user.displayName || 'Artist',
        tracks.map(t => t.title)
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Publishing Health
                    </h2>
                    <p className="text-slate-500 mt-1">Audit your royalty collection setup</p>
                </div>
                <button
                    onClick={runAudit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Run Audit
                </button>
            </div>

            {/* Score Card */}
            {report && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center">
                        <div className={`text-6xl font-black ${getGradeColor(report.grade)}`}>
                            {report.grade}
                        </div>
                        <div className="text-sm text-slate-500 mt-2">Overall Grade</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {report.overallScore}/100
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-bold text-slate-500 uppercase">Critical Issues</span>
                        </div>
                        <div className="text-4xl font-black text-red-500">{report.criticalIssues.length}</div>
                        <div className="text-sm text-slate-500 mt-1">Require immediate action</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <DollarSign className="w-5 h-5 text-yellow-500" />
                            <span className="text-sm font-bold text-slate-500 uppercase">Est. Lost Revenue</span>
                        </div>
                        <div className="text-4xl font-black text-yellow-500">
                            ${report.estimatedLostRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">Per year from issues</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-bold text-slate-500 uppercase">Opportunities</span>
                        </div>
                        <div className="text-4xl font-black text-green-500">{report.opportunities.length}</div>
                        <div className="text-sm text-slate-500 mt-1">Ways to increase revenue</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                {[
                    { id: 'overview', label: 'Overview', icon: Shield },
                    { id: 'pro', label: 'PRO Setup', icon: Music },
                    { id: 'mlc', label: 'MLC Setup', icon: Building2 },
                    { id: 'recovery', label: 'Revenue Recovery', icon: DollarSign }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                            activeTab === tab.id
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && report && (
                <div className="space-y-6">
                    {/* Action Plan */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Priority Action Plan
                        </h3>
                        <div className="space-y-3">
                            {report.actionPlan.slice(0, 5).map((action, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl"
                                >
                                    <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {action.priority}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 dark:text-white">{action.action}</div>
                                        <div className="text-xs text-slate-500 mt-1">
                                            {action.category.toUpperCase()} • {action.estimatedTime}
                                        </div>
                                    </div>
                                    {action.url && (
                                        <a
                                            href={action.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(report.sections).map(([key, section]) => (
                            <div
                                key={key}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-bold text-slate-900 dark:text-white">{section.name}</span>
                                    {getStatusIcon(section.status)}
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-2">
                                    <div
                                        className={`h-2 rounded-full ${
                                            section.status === 'healthy' ? 'bg-green-500' :
                                            section.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${(section.score / section.maxScore) * 100}%` }}
                                    />
                                </div>
                                <div className="text-xs text-slate-500">
                                    {section.score}/{section.maxScore} points
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'pro' && (
                <div className="space-y-6">
                    {/* PRO Setup Form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Your PRO Membership
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Select Your PRO
                                </label>
                                <select
                                    value={publishingInfo.proMembership.pro}
                                    onChange={(e) => setPublishingInfo({
                                        ...publishingInfo,
                                        proMembership: { ...publishingInfo.proMembership, pro: e.target.value }
                                    })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                                >
                                    <option value="">Not registered with a PRO</option>
                                    {PERFORMANCE_RIGHTS_ORGS.filter(p => p.country === 'US').map(pro => (
                                        <option key={pro.id} value={pro.id}>{pro.name} - {pro.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                    Member ID / IPI Number
                                </label>
                                <input
                                    type="text"
                                    value={publishingInfo.proMembership.memberId}
                                    onChange={(e) => setPublishingInfo({
                                        ...publishingInfo,
                                        proMembership: { ...publishingInfo.proMembership, memberId: e.target.value }
                                    })}
                                    placeholder="Enter your PRO member ID"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PRO Comparison */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            US PRO Comparison
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-slate-500 uppercase">
                                        <th className="pb-3">PRO</th>
                                        <th className="pb-3">Join Fee</th>
                                        <th className="pb-3">Payment Schedule</th>
                                        <th className="pb-3">Best For</th>
                                        <th className="pb-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {PERFORMANCE_RIGHTS_ORGS.filter(p => p.country === 'US').map(pro => (
                                        <tr key={pro.id}>
                                            <td className="py-3 font-bold text-slate-900 dark:text-white">
                                                <span style={{ color: pro.color }}>{pro.name}</span>
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">
                                                ${pro.fees.writer}
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400">
                                                {pro.paymentSchedule}
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-400 max-w-xs">
                                                {pro.description.substring(0, 60)}...
                                            </td>
                                            <td className="py-3">
                                                <a
                                                    href={pro.registrationUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-500 hover:text-cyan-400"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'mlc' && (
                <div className="space-y-6">
                    {/* MLC Registration Status */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">
                                    The MLC Registration
                                </h3>
                                <p className="text-slate-500 text-sm">
                                    The MLC collects mechanical royalties from US streaming services (Spotify, Apple Music, etc.)
                                </p>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={publishingInfo.mlcRegistered}
                                    onChange={(e) => setPublishingInfo({
                                        ...publishingInfo,
                                        mlcRegistered: e.target.checked
                                    })}
                                    className="w-5 h-5 rounded"
                                />
                                <span className="text-sm font-bold text-slate-900 dark:text-white">I'm registered</span>
                            </label>
                        </div>

                        {!publishingInfo.mlcRegistered && (
                            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-yellow-600 dark:text-yellow-400">
                                            You may be missing mechanical royalties
                                        </div>
                                        <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                                            Without MLC registration, your streaming mechanical royalties go to the "black box" and may never reach you.
                                        </p>
                                        <a
                                            href="https://portal.themlc.com/register"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 mt-3 bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-400"
                                        >
                                            Register Free <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MLC Registration Guide */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Registration Steps
                        </h3>
                        <div className="space-y-4">
                            {mlcService.getRegistrationGuide().steps.map((step) => (
                                <div key={step.step} className="flex gap-4">
                                    <div className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                        {step.step}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{step.title}</div>
                                        <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                                        {step.url && (
                                            <a
                                                href={step.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-cyan-500 text-sm mt-1 hover:underline"
                                            >
                                                Go to step <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Streaming Rates */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Mechanical Royalty Rates by Service
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {mlcService.getStreamingServices().slice(0, 8).map(service => (
                                <div key={service.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                                    <div className="font-bold text-slate-900 dark:text-white">{service.name}</div>
                                    <div className="text-lg font-black text-cyan-500 mt-1">{service.mechanicalRate}</div>
                                    <div className="text-xs text-slate-500 mt-1">per stream</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'recovery' && (
                <div className="space-y-6">
                    {/* Search Links */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Search for Unclaimed Royalties
                        </h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Click each link below to search for your music and verify your registrations.
                        </p>
                        <div className="space-y-3">
                            {searchUrls.map((search, idx) => (
                                <a
                                    key={idx}
                                    href={search.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                                            <Search className="w-5 h-5 text-cyan-500" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{search.source}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{search.instructions}</div>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-cyan-500" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Registration Checklist */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4">
                            Essential Registrations
                        </h3>
                        {(() => {
                            const checklist = revenueRecoveryService.getRegistrationChecklist();
                            return (
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs font-bold text-green-500 uppercase mb-3">Essential (Do First)</div>
                                        <div className="space-y-2">
                                            {checklist.essential.map((item, idx) => (
                                                <a
                                                    key={idx}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl hover:bg-green-500/10"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-xs text-slate-500">{item.description}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-green-500">{item.cost}</div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-cyan-500 uppercase mb-3">Recommended</div>
                                        <div className="space-y-2">
                                            {checklist.recommended.map((item, idx) => (
                                                <a
                                                    key={idx}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900"
                                                >
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                                                        <div className="text-xs text-slate-500">{item.description}</div>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-500">{item.cost}</div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublishingHealth;

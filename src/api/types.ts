export interface WorkflowRun {
    run_id: string;
    status: string;
    final_status?: string;
    current_stage: string;
    completed_stages?: string[];
    actions_executed: number;
    created_at: string;
    completed_at?: string;
    updated_at?: string;
    error?: string;
}

export interface Metric {
    value: number;
    label: string;
    trend?: number;
}

export interface Decision {
    action_type: string;
    summary: string;
    reason?: string;
    impact?: string;
    risk_level?: 'low' | 'medium' | 'high';
}

export interface Insight {
    title: string;
    detail: string;
    source?: string;
}

export interface RunState {
    run_id: string;
    current_state: {
        insights: Insight[];
        decisions: {
            tier_1_must_act_now: Decision[];
            tier_2_high_leverage: Decision[];
            tier_3_monitor_only: Decision[];
            email_campaign_recommendations: Decision[];
        };
        approvals: {
            status: string;
            pending_actions: any[];
            approved_action_ids: string[];
        };
        metrics: Record<string, Metric>;
        signals: Record<string, any>;
    };
}

export interface Action {
    action_id: string;
    action_type: string;
    status: string;
    risk_level: 'low' | 'medium' | 'high';
    ai_confidence_score: number;
    estimated_impact: Record<string, any>;
    preview_payload: {
        summary?: string;
        reason?: string;
        lead_email?: string;
        lead_company?: string;
        urgency?: string;
        [key: string]: any;
    };
    configuration_payload?: Record<string, any>;
    source_workflow_run_id?: string;
    source_lead_id?: string;
    scheduled_at?: string;
    created_at: string;
    approved_at?: string | null;
    executed_at?: string | null;
    rejected_at?: string | null;
    failed_at?: string | null;
    retry_count?: number;
    allowed_transitions?: string[];
    is_terminal?: boolean;
    notes?: string;
}

export interface ActionStats {
    total: number;
    pending_approval: number;
    executed: number;
    failed: number;
    rejected: number;
    counts_by_status?: Record<string, number>;
    pending_by_type?: Record<string, number>;
}

export interface TimelineNode {
    id: string;
    tool: string;
    stage: string;
    timestamp: string;
    success: boolean;
    cost: number;
    cached: boolean;
    execution_time_ms: number;
}

export interface WorkflowGraph {
    run_id: string;
    timeline: TimelineNode[];
    budget_breakdown: {
        total_cost: number;
        cached_calls: number;
        by_integration: Record<string, number>;
    };
    nodes: any[];
    edges: any[];
}


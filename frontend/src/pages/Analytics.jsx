import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { StatCard } from '../components/cards/StatCard.jsx';
import { Card, CardHeader } from '../components/common/Card.jsx';
import { SegmentedControl } from '../components/common/SegmentedControl.jsx';
import { Avatar } from '../components/common/Avatar.jsx';
import { ProgressBar } from '../components/common/ProgressBar.jsx';
import { SkeletonRow } from '../components/common/Skeleton.jsx';
import { ErrorState } from '../components/common/EmptyState.jsx';
import { AreaChart } from '../components/charts/AreaChart.jsx';
import { BarChart } from '../components/charts/BarChart.jsx';
import { DonutChart } from '../components/charts/DonutChart.jsx';
import { ChartCard } from '../components/charts/ChartCard.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { analyticsAPI } from '../services/api.js';

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const { data, loading, error, refetch } = useAsync(() => analyticsAPI.overview({ range }), [range]);

  return (
    <AppLayout>
      <PageHeader
        title="Analytics"
        description="How documentation and collaboration move across your workspace."
        actions={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
            ]}
          />
        }
      />

      {error && <ErrorState onRetry={refetch} />}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total notes" value={data?.totals.notes} delta={data?.deltas.notes} icon="note" loading={loading} />
        <StatCard label="Files uploaded" value={data?.totals.files} delta={data?.deltas.files} icon="files" loading={loading} />
        <StatCard label="Active members" value={data?.totals.activeMembers} delta={data?.deltas.activeMembers} icon="users" loading={loading} />
        <StatCard label="Project activity" value={data?.totals.activityEvents} delta={data?.deltas.activityEvents} icon="trendingUp" loading={loading} />
      </div>

      <div className="mt-6 space-y-6">
        <ChartCard
          title="Activity over time"
          description="Notes, uploads, joins and generated docs combined"
          loading={loading}
        >
          {data && <AreaChart id="workspace-activity" data={data.activity} labels={data.labels} height={240} />}
        </ChartCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title="Notes created" description="Documentation written per day" loading={loading}>
            {data && <AreaChart id="notes-created" data={data.notesCreated} labels={data.labels} height={190} color="var(--c-violet)" />}
          </ChartCard>
          <ChartCard title="Files uploaded" description="New files per day" loading={loading}>
            {data && <AreaChart id="files-uploaded" data={data.filesUploaded} labels={data.labels} height={190} color="#39c5bb" />}
          </ChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          <ChartCard title="Activity by weekday" description="When your team actually writes" loading={loading}>
            {data && <BarChart data={data.weekActivity} labels={data.weekLabels} height={190} />}
          </ChartCard>
          <ChartCard title="File mix" description="What the workspace is made of" loading={loading}>
            {data && <DonutChart data={data.fileMix} centerLabel="files" />}
          </ChartCard>
        </div>

        <Card className="overflow-hidden">
          <CardHeader title="Member contribution" description="Notes, files and activity events per person" />

          <div className="hidden items-center gap-4 border-b border-line px-4 py-2.5 text-[11.5px] text-faint sm:flex">
            <span className="w-8" />
            <span className="flex-1">Member</span>
            <span className="w-20 text-right">Notes</span>
            <span className="w-20 text-right">Files</span>
            <span className="w-24 text-right">Activity</span>
            <span className="w-32">Share</span>
          </div>

          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={4} />)}

          {!loading &&
            (data?.contributions || []).map((row) => (
              <div
                key={row.userId}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-raised"
              >
                <Avatar user={row.user} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{row.user?.name}</span>
                  <span className="block truncate text-[11.5px] text-faint">@{row.user?.username}</span>
                </span>
                <span className="w-20 text-right text-[13px] tabular-nums text-muted">{row.notes}</span>
                <span className="w-20 text-right text-[13px] tabular-nums text-muted">{row.files}</span>
                <span className="w-24 text-right text-[13px] tabular-nums text-muted">{row.activity}</span>
                <span className="w-32">
                  <ProgressBar value={row.share * 3} height={4} />
                </span>
              </div>
            ))}
        </Card>
      </div>
    </AppLayout>
  );
}

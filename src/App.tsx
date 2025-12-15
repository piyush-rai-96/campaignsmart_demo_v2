import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { CampaignOverview } from '@/pages/campaigns/campaign-overview'
import { ActiveCampaign } from '@/pages/campaigns/active-campaign'
import { CampaignWorkspace } from '@/pages/campaigns/campaign-workspace'
import { CreativeStudio } from '@/pages/creative-studio/creative-studio'
import { SegmentLibrary } from '@/pages/libraries/segment-library'
import { PromoLibrary } from '@/pages/libraries/promo-library'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/campaigns" replace />} />
          <Route path="campaigns" element={<CampaignWorkspace />} />
          <Route path="campaigns/overview" element={<CampaignOverview />} />
          <Route path="campaigns/:id" element={<ActiveCampaign />} />
          <Route path="creative-studio" element={<CreativeStudio />} />
          <Route path="segments" element={<SegmentLibrary />} />
          <Route path="promos" element={<PromoLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

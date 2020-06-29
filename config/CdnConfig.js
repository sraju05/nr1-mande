export default {
    title: 'Deliver - CDN',
    eventTypes: [
      {
        event: 'Global',
        attributes: [
          ['appName', 'Platform'],
          ['playerVersion', 'Player'],
          ['playerName', 'Player'],
          ['contentSrc', 'Content'],
          ['countryCode', 'Geography'],
          ['contentIsLive', 'Content'],
          ['contentTitle', 'Content'],
        ],
      },
      {
        event: 'PageAction',
        eventSelector: { attribute: 'Delivery Type', value: 'Web' },
        attributes: [
          ['userAgentName', 'Platform'],
          ['userAgentOS', 'Platform'],
          ['userAgentVersion', 'Platform'],
          ['isAd', 'Content'],
          ['asnOrganization', 'Geography'],
          ['city', 'Geography'],
          ['regionCode', 'Geography'],
          ['message', 'Error'],
        ],
      },
      {
        event: 'MobileVideo',
        eventSelector: { attribute: 'Delivery Type', value: 'Mobile' },
        attributes: [
          ['isAd', 'Content'],
          ['asnOrganization', 'Geography'],
          ['city', 'Geography'],
          ['regionCode', 'Geography'],
          ['device', 'Platform'],
          ['deviceGroup', 'Platform'],
          ['deviceType', 'Platform'],
          ['osName', 'Platform'],
          ['osVersion', 'Platform'],
          ['message', 'Error'],
        ],
      },
      {
        event: 'RokuVideo',
        eventSelector: { attribute: 'Delivery Type', value: 'OTT' },
        attributes: [
          ['device', 'Platform'],
          ['deviceGroup', 'Platform'],
          ['deviceType', 'Platform'],
          ['osName', 'Platform'],
          ['osVersion', 'Platform'],
          ['errorMessage', 'Error'],
        ],
      },
    ],
    overviewConfig: [
      {
        nrql: `SELECT filter(average(timeSinceLoad), WHERE actionName = 'CONTENT_REQUEST') as 'Time to Content Request', 
        average(timeSinceLoad) as 'Time to Player Ready',
        filter(average(timeSinceRequested)/1000, WHERE actionName='CONTENT_START') as 'Time To First Frame'
        FROM PageAction TIMESERIES `,
        columnStart: 1,
        columnEnd: 6,
        chartSize: 'medium',
        chartType: 'area',
        title: 'Content Request vs Player Ready vs Video Start (Average in Seconds)',
        useSince: true,
      },
      {
        nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Total Requests', 
        filter(count(*), WHERE actionName = 'CONTENT_START') as 'Total Starts' 
        FROM PageAction TIMESERIES `,
        columnStart: 7,
        columnEnd: 12,
        chartSize: 'medium',
        chartType: 'line',
        title: 'Total Requests vs Total Starts',
        useSince: true,
      },
      {
        nrql: `SELECT filter(count(*), WHERE actionName = 'CONTENT_ERROR') / filter(count(*), WHERE actionName = 'CONTENT_REQUEST') as 'Video Errors', 
        filter(count(*), WHERE actionName = 'CONTEN_ERROR' and contentPlayhead = 0) AS 'Failures Before Start' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
        columnStart: 1,
        columnEnd: 4,
        chartSize: 'medium',
        chartType: 'area',
        title: 'Video Errors and Failures Before Start',
        useSince: true,
      },
      {
        nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
        columnStart: 5,
        columnEnd: 8,
        chartSize: 'medium',
        chartType: 'area',
        title: 'Video Errors and Failures Before Start',
        useSince: true,
      },
      {
        nrql: `SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and isInitialBuffering = 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) as 'Rebuffer Ratio' FROM PageAction, MobileVideo, RokuVideo TIMESERIES `,
        columnStart: 9,
        columnEnd: 12,
        chartSize: 'medium',
        chartType: 'area',
        title: 'Interruption Ratio',
        useSince: true,
      },
    ],
    metrics: [
      {
        title: '5xx Errors (Count)',
        threshold: {
          critical: 5,
          warning: 3,
        },
        query: {
          nrql: `SELECT average(provider.error5xxErrorRate.Average) as 'result' FROM LoadBalancerSample WHERE providerAccountId = '36376' and provider = 'CloudFrontDistribution'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `SELECT (filter(uniqueCount(viewId), WHERE timeSinceLoad > 6.5)/count(*)) * 100 as '%' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY'`,
            columnStart: 1,
            columnEnd: 4,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views above Threshold (6.5s)',
            useSince: true,
          },
          {
            nrql: `SELECT average(timeSinceLoad) as 'Time To Player Ready (Average)' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY' FACET viewId LIMIT 25`,
            noFacet: true,
            columnStart: 5,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Slowest Player Ready Time by View, Average (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `SELECT average(timeSinceLoad) as 'Player Ready Time' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY' `,
            facets: `deviceType`,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Player Ready Time (50%)',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceLoad, 50) WHERE actionName = 'PLAYER_READY' TIMESERIES auto `,
            facets: `deviceType`,
            columnStart: 4,
            columnEnd: 8,
            chartSize: 'small',
            chartType: 'area',
            title: 'Player Ready Time by Device Type',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT histogram(timeSinceLoad, buckets: 10, width: 20) WHERE actionName = 'PLAYER_READY' `,
            facets: `deviceType`,
            columnStart: 9,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'heatmap',
            title: 'Player Ready Time by Device Type',
            useSince: true,
          },
          {
            nrql: `SELECT average(timeSinceLoad) as 'Player Ready Time' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'PLAYER_READY' TIMESERIES MAX `,
            columnStart: 1,
            columnEnd: 12,
            chartSize: 'medium',
            chartType: 'scatter',
            title: 'Player Ready Time (Average)',
            useSince: true,
          },
        ],
      },
      {
        title: '4xx Errors (Count)',
        threshold: {
          critical: 10,
          warning: 5,
        },
        query: {
          nrql: `SELECT average(provider.error4xxErrorRate.Average) as 'result' FROM LoadBalancerSample WHERE providerAccountId = '36376' and provider = 'CloudFrontDistribution'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT filter(uniqueCount(viewId), where actionName = 'CONTENT_ERROR' and contentPlayhead = 0) / filter(uniqueCount(viewId), where actionName = 'CONTENT_REQUEST') * 100 as '%' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views above Threshold (2%)',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT count(*) where actionName = 'CONTENT_ERROR' and contentPlayhead = 0 facet viewId LIMIT 25`,
            noFacet: 'true',
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Views with Video Start Failures (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction SELECT filter(count(*), where actionName = 'CONTENT_ERROR' and contentPlayhead = 0) / filter(count(*), where actionName = 'CONTENT_REQUEST') * 100 as '%' TIMESERIES MAX `,
            columnStart: 1,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Video Start Failure Ratio',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT count(*) where actionName = 'CONTENT_ERROR' and contentPlayhead = 0 LIMIT 25 `,
            facets: 'message',
            columnStart: 1,
            columnEnd: 12,
            chartSize: 'medium',
            chartType: 'bar',
            title: 'Video Start Failures by Error Message',
            useSince: true,
          },
        ],
      },
      {
        title: '5xx Errors (Count)',
        threshold: {
          critical: 5,
          warning: 2,
        },
        query: {
          nrql: `SELECT sum(provider.error5xxErrors.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT filter(uniqueCount(viewId), where actionName = 'CONTENT_ERROR' and contentPlayhead > 0) / filter(uniqueCount(viewId), where actionName = 'CONTENT_REQUEST') * 100 as '%' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views above Threshold (.15%)',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT count(*) where actionName = 'CONTENT_ERROR' and contentPlayhead > 0 facet viewId LIMIT 25`,
            noFacet: true,
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Views with Errors (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction SELECT filter(count(*), where actionName = 'CONTENT_ERROR' and contentPlayhead > 0) / filter(count(*), where actionName = 'CONTENT_REQUEST') * 100 as '%' TIMESERIES MAX `,
            facets: 'deviceType',
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'medium',
            chartType: 'area',
            title: 'In-Stream Error Ratio',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT count(*) where actionName = 'CONTENT_ERROR' and contentPlayhead > 0 `,
            facets: 'message',
            columnStart: 7,
            columnEnd: 12,
            chartSize: 'medium',
            chartType: 'bar',
            title: 'In-Stream Errors by Message',
            useSince: true,
          },
        ],
      },
      {
        title: 'All Requests',
        threshold: {
          critical: 100,
          warning: 80,
        },
        query: {
          nrql: `SELECT sum(provider.allRequests.Sum) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `SELECT filter(uniqueCount(viewId), WHERE timeSinceRequested > 4000) / uniqueCount(viewId) * 100 as '%' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views above Threshold (4s)',
            useSince: true,
          },
          {
            nrql: `SELECT average(timeSinceRequested/1000) as 'Time To First Frame (Average)' FROM PageAction, MobileVideo, RokuVideo WHERE actionName = 'CONTENT_START' FACET viewId LIMIT 25`,
            noFacet: true,
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Views, Average Join Time Since Requested (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(timeSinceLoad, 50) as 'seconds' WHERE actionName = 'CONTENT_START' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Join Time - Aggregate, Content',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(timeSinceLoad, 50) as 'seconds' WHERE actionName = 'CONTENT_START' TIMESERIES MAX `,
            facets: 'deviceType',
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Join Time - Aggregate, Content',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(timeSinceRequested/1000, 50) as 'seconds' WHERE actionName = 'CONTENT_START'`,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Join Time Since Requested',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(timeSinceRequested/1000, 50) as 'seconds' WHERE actionName = 'CONTENT_START' TIMESERIES MAX `,
            facets: 'deviceType',
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Join Time Since Requested',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(percentile(timeSinceLastAd/1000,50), WHERE actionName = 'CONTENT_START') + filter(percentile(timeSinceRequested/1000, 50), WHERE actionName = 'AD_REQUEST') as 'seconds (50%)'`,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Join Time - Content without Ads',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(percentile(timeSinceLastAd/1000,50), WHERE actionName = 'CONTENT_START') + filter(percentile(timeSinceRequested/1000, 50), WHERE actionName = 'AD_REQUEST') as 'seconds' TIMESERIES MAX `,
            facets: 'deviceType',
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Join Time - Content without Ads',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceRequested/1000,50) as 'seconds' where actionName = 'AD_START' and adPosition = 'pre'`,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Join Time - Pre Roll Ad',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceRequested/1000,50) as 'seconds' where actionName = 'AD_START' and adPosition = 'pre' TIMESERIES MAX `,
            facets: 'deviceType',
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Join Time - Pre Roll Ad',
            useSince: true,
          },
        ],
      },
      {
        title: '# of Objects (Avg)',
        threshold: {
          critical: 10,
          warning: 8,
        },
        query: {
          nrql: `SELECT average(provider.numberOfObjects.Average) as 'result'from DatastoreSample WHERE provider.bucketName like '%source%'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and contentPlayhead > 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) * 100 as '%' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Rebuffering Ratio',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT sum(timeSinceBufferBegin)/1000 as 'Total Buffering' WHERE actionName = 'CONTENT_BUFFER_END' and contentPlayhead > 0 FACET viewId LIMIT 25 `,
            noFacet: true,
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Sessions with most Rebuffering, Seconds (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(sum(timeSinceBufferBegin), WHERE actionName = 'CONTENT_BUFFER_END' and contentPlayhead > 0) / filter(sum(playtimeSinceLastEvent), WHERE contentPlayhead is not null) * 100 as '%' TIMESERIES MAX `,
            facets: `deviceType`,
            columnStart: 1,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Rebuffering Ratio by Device Type',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceBufferBegin/1000, 50) as 'seconds', percentile(timeSinceBufferBegin/1000, 90) as 'seconds', percentile(timeSinceBufferBegin/1000, 95) as 'seconds', percentile(timeSinceBufferBegin/1000, 99) as 'seconds' WHERE actionName = 'CONTENT_BUFFER_END' and contentPlayhead = 0 `,
            columnStart: 1,
            columnEnd: 4,
            chartSize: 'medium',
            chartType: 'billboard',
            title: 'Initial Buffer Time',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT percentile(timeSinceBufferBegin/1000, 50) as 'seconds', percentile(timeSinceBufferBegin/1000, 90) as 'seconds', percentile(timeSinceBufferBegin/1000, 95) as 'seconds', percentile(timeSinceBufferBegin/1000, 99) as 'seconds' WHERE actionName = 'CONTENT_BUFFER_END' and contentPlayhead = 0 TIMESERIES MAX `,
            facets: '',
            columnStart: 5,
            columnEnd: 12,
            chartSize: 'medium',
            chartType: 'area',
            title: 'Initial Buffer Time',
            useSince: true,
          },
        ],
      },
      {
        title: 'First Byte Latency - Avg (ms)',
        threshold: {
          critical: 150,
          warning: 100,
        },
        query: {
          nrql: `SELECT average(provider.firstByteLatency.Average) as 'result' from DatastoreSample WHERE provider = 'S3BucketRequests' AND entityName like '%source%'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT filter(uniqueCount(viewId), where contentBitrate <= 4000000) / uniqueCount(viewId) * 100 as '%' WHERE contentBitrate is not null `,
            columnStart: 1,
            columnEnd: 4,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views below Threshold (4 mbsp)',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT average(contentBitrate)/1000000 as 'mbps' where contentBitrate is not null facet viewId LIMIT 25`,
            noFacet: true,
            columnStart: 5,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Average Content Bitrate by View (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(contentBitrate, 50)/1000000, percentile(contentBitrate, 90)/1000000, percentile(contentBitrate, 95)/1000000, percentile(contentBitrate, 99)/1000000 where contentBitrate is not null `,
            columnStart: 1,
            columnEnd: 6,
            chartSize: 'medium',
            chartType: 'billboard',
            title: 'Content Bitrate Percentile',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(contentBitrate, 50)/1000000 as '', percentile(contentBitrate, 90)/1000000 as '', percentile(contentBitrate, 95)/1000000 as '', percentile(contentBitrate, 99)/1000000 as '' where contentBitrate is not null  FACET eventType() `,
            noFacet: true,
            columnStart: 7,
            columnEnd: 12,
            chartSize: 'medium',
            chartType: 'billboard',
            title: 'Content Bitrate Percentile by Event Type',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, RokuVideo, MobileVideo SELECT percentile(contentBitrate, 50)/1000000, percentile(contentBitrate, 90)/1000000, percentile(contentBitrate, 95)/1000000, percentile(contentBitrate, 99)/1000000 where contentBitrate is not null TIMESERIES MAX `,
            columnStart: 1,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'area',
            title: 'Content Bitrate Percentile',
            useSince: true,
          },
        ],
      },
      {
        title: 'Total Request Latency - Avg (ms)',
        threshold: {
          critical: 200,
          warning: 180,
        },
        query: {
          nrql: `SELECT average(provider.totalRequestLatency.Average) as 'result' from DatastoreSample where provider='S3BucketRequests' where entityName like '%source%'`,
          lookup: 'result',
        },
        detailConfig: [
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(uniqueCount(viewId), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(uniqueCount(viewId), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Views above Threshold (23%)',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT count(*) WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0 FACET viewId LIMIT 25 `,
            noFacet: true,
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'bar',
            title: 'Views with Interruptions (Click for details)',
            useSince: true,
            click: 'openSession',
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(count(*), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(count(*), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' `,
            columnStart: 1,
            columnEnd: 3,
            chartSize: 'small',
            chartType: 'billboard',
            title: 'Interruption Ratio',
            useSince: true,
          },
          {
            nrql: `FROM PageAction, MobileVideo, RokuVideo SELECT filter(count(*), WHERE actionName = 'CONTENT_BUFFER_START' and contentPlayhead > 0) / filter(count(*), WHERE actionName IN ('CONTENT_START', 'CONTENT_NEXT')) * 100 as '%' timeseries MAX `,
            facets: `deviceType`,
            columnStart: 4,
            columnEnd: 12,
            chartSize: 'small',
            chartType: 'line',
            title: 'Interruption Ratio',
            useSince: true,
          },
        ],
      },
    ],
  }
  
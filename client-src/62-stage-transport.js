/* 62-stage-transport — SSE revision stream with polling fallback.
 *
 * The hook is deliberately small and DOM-free apart from EventSource/network:
 * the component keeps its normal poll and a failed stream only loses push latency. */
(function () {
  'use strict';

  const useEffect = React.useEffect;
  const useRef = React.useRef;

  function useStageStream(sessionId, onRevision) {
    const callbackRef = React.useRef(onRevision);
    callbackRef.current = onRevision;
    useEffect(
      function () {
        if (!sessionId || typeof EventSource === 'undefined') return undefined;
        let source = null;
        let last = null;
        try {
          source = new EventSource('/api/mathlab/events?sessionId=' + encodeURIComponent(sessionId));
        } catch (streamError) {
          return undefined;
        }
        const onStage = function (event) {
          try {
            const payload = JSON.parse(event.data);
            const revision = payload && typeof payload.revision === 'number' ? payload.revision : null;
            if (revision !== null && revision !== last) {
              last = revision;
              if (typeof callbackRef.current === 'function') callbackRef.current();
            }
          } catch (parseError) {
            /* ignore malformed frames; polling still converges */
          }
        };
        try {
          source.addEventListener('stage', onStage);
        } catch (listenError) {
          try {
            source.onmessage = onStage;
          } catch (assignError) {
            /* no stream support */
          }
        }
        return function () {
          try {
            source.removeEventListener('stage', onStage);
          } catch (removeError) {
            /* ignore */
          }
          try {
            source.close();
          } catch (closeError) {
            /* ignore */
          }
        };
      },
      [sessionId],
    );
  }


  ML.stageTransport = { useStageStream: useStageStream };
})();

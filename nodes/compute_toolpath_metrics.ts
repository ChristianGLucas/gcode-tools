import { ComputeToolpathMetricsInput, ToolpathMetrics, BoundingBox, Point3 } from '../gen/messages_pb';
import { AxiomContext } from '../gen/axiomContext';
import { resolveToolpath } from './gcode_lib';

/**
 * Resolve a G-code file's full toolpath and summarize it geometrically and
 * temporally: the axis-aligned bounding box of every point visited (rapid
 * AND feed moves), total rapid-travel distance, total cut distance, an
 * estimated run-time, and the distinct feedrates/spindle-speeds/tools used.
 * Positions are tracked through G90/G91 (absolute/relative), G20/G21
 * (inch/mm — internally normalized to millimeters, so bounding_box and
 * every distance here are always in mm regardless of the file's own
 * units), and G2/G3 arcs are interpolated to their true curved length
 * (including a helical Z rise), never just the straight chord between
 * endpoints. rapid_feedrate lets you supply your machine's real rapid
 * traverse rate (units/min) for the time estimate; 0 uses a 3000 mm/min
 * default. A cut move (G1/G2/G3) traversed before any F word appears in
 * the file contributes 0 to the time estimate rather than guessing — the
 * estimate is an honest lower bound, not a promise.
 *
 * @param ax - Platform context: ax.log for logging, ax.secrets for secrets.
 */
export function computeToolpathMetrics(ax: AxiomContext, input: ComputeToolpathMetricsInput): ToolpathMetrics {
  const out = new ToolpathMetrics();
  const content = input.getContent();

  const resolution = resolveToolpath(content, input.getRapidFeedrate());

  let rapidDistance = 0;
  let cutDistance = 0;
  for (const segment of resolution.segments) {
    if (segment.motion === 'G0') {
      rapidDistance += segment.distance;
    } else {
      cutDistance += segment.distance;
    }
  }

  if (resolution.hasAnyPoint) {
    const bbox = new BoundingBox();
    const min = new Point3();
    min.setX(resolution.min.x);
    min.setY(resolution.min.y);
    min.setZ(resolution.min.z);
    const max = new Point3();
    max.setX(resolution.max.x);
    max.setY(resolution.max.y);
    max.setZ(resolution.max.z);
    const extents = new Point3();
    extents.setX(resolution.max.x - resolution.min.x);
    extents.setY(resolution.max.y - resolution.min.y);
    extents.setZ(resolution.max.z - resolution.min.z);
    bbox.setMin(min);
    bbox.setMax(max);
    bbox.setExtents(extents);
    out.setBoundingBox(bbox);
  }

  out.setRapidDistance(rapidDistance);
  out.setCutDistance(cutDistance);
  out.setTotalDistance(rapidDistance + cutDistance);
  out.setEstimatedTimeSeconds(resolution.estimatedTimeMinutes * 60);
  out.setUnits('mm');
  out.setFeedRatesUsedList(Array.from(resolution.feedRatesUsed).sort((a, b) => a - b));
  out.setSpindleSpeedsUsedList(Array.from(resolution.spindleSpeedsUsed).sort((a, b) => a - b));
  out.setToolsUsedList(Array.from(resolution.toolsUsed).sort((a, b) => a - b));
  out.setMoveCount(resolution.segments.length);
  return out;
}

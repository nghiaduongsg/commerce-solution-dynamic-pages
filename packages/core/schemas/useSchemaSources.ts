import { useEffect, useState } from 'react';
import axios from 'axios';
import { applySchemaSource, SchemaSource } from './schemaFields';

export default function useSchemaSources(
  base: any,
  selected: string,
  apiUrl: string,
  enabled: boolean,
  onReady: (schemas: any, subType: string) => void,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    const sources: SchemaSource[] = base?.uiSchema?.['ui:schemaSources'] || [];
    if (!enabled || !sources.length) return;
    setError(false);
    if (!selected) {
      setLoading(false);
      onReady(base, '');
      return;
    }
    const abort = new AbortController();
    setLoading(true);
    Promise.all(
      sources.map((source) =>
        axios.get(
          `${apiUrl.replace(/\/$/, '')}/${source.url.replace('{value}', encodeURIComponent(selected))}`,
          { signal: abort.signal },
        ),
      ),
    )
      .then((results) => {
        if (abort.signal.aborted) return;
        let resolved = { schema: base.schema, uiSchema: base.uiSchema };
        sources.forEach((source, index) => {
          resolved = applySchemaSource(
            resolved.schema,
            resolved.uiSchema,
            source,
            results[index].data,
          );
        });
        onReady({ ...base, ...resolved }, selected);
      })
      .catch(() => {
        if (!abort.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [base, selected, apiUrl, enabled, onReady]);
  return { loading, error };
}

import { useCallback, useEffect, useRef } from 'react';
import warning from 'warning';
import useTessen from './useTessen';
import { CAMEL_CASE, TITLE_CASE } from '../utils/constants';
import { convertToCamelCase, convertToTitleCase } from '../utils/changeCase';

const useInstrumentedHandler = (handler, attributes) => {
  const savedHandler = useRef();
  const tessen = useTessen();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  // console.log({ attributes });
  return useCallback(
    (...args) => {
      const { eventName, category, ...attrs } =
        typeof attributes === 'function' ? attributes(...args) : attributes;

      if (window.Tessen) {
        warning(
          eventName,
          'You are attempting to instrument a handler, but the `eventName` property is not set. This will result in a no-op.'
        );

        eventName &&
          warning(
            CAMEL_CASE.test(eventName),
            `You are attempting to instrument a handler, but the 'eventName' property is not in camelCase. This will result in a no-op. Please change '${eventName}' to something like '${convertToCamelCase(
              eventName
            )}'.`
          );

        warning(
          category,
          'You are attempting to instrument a handler, but the `category` property is not set. This will result in a no-op.'
        );

        category &&
          warning(
            TITLE_CASE.test(category),
            `You are attempting to instrument a handler, but the 'category' is not in TitleCase. This will result in a no-op. Please change '${category}' to something like '${convertToTitleCase(
              category
            )}'.`
          );

        eventName && category && tessen.track(eventName, category, attrs);
      }

      if (savedHandler.current) {
        return savedHandler.current(...args);
      }
    },
    [attributes, tessen]
  );
};

export default useInstrumentedHandler;

import React from 'react';
import PropTypes from 'prop-types';
import useMedia from 'use-media';
import path from 'path';
import { css } from '@emotion/react';
import { graphql, useStaticQuery, Link } from 'gatsby';
import { useLocation } from '@reach/router';
import AnnouncementBanner from './AnnouncementBanner';
import DarkModeToggle from './DarkModeToggle';
import ExternalLink from './ExternalLink';
import Button from './Button';
import Dropdown from './Dropdown';
import NewRelicLogo from './NewRelicLogo';
import Icon from './Icon';
import GlobalNavLink from './GlobalNavLink';
import SearchInput from './SearchInput';
import SearchModal from './SearchModal';
import SplitTextButton from './SplitTextButton';
import useQueryParams from '../hooks/useQueryParams';
import useThemeTranslation from '../hooks/useThemeTranslation';
import useHasMounted from '../hooks/useHasMounted';
import useInstrumentedHandler from '../hooks/useInstrumentedHandler';

export const NR_SITES = {
  DOCS: 'DOCS',
  DEVELOPER: 'DEVELOPER',
  COMMUNITY: 'COMMUNITY',
  LEARN: 'LEARN',
};

const HEADER_LINKS = new Map();

HEADER_LINKS.set(NR_SITES.DOCS, {
  text: 'Docs',
  href: 'https://docs.newrelic.com/',
})
  .set(NR_SITES.DEVELOPER, {
    text: 'Developer',
    href: 'https://developer.newrelic.com/',
  })
  .set(NR_SITES.COMMUNITY, {
    text: 'Community',
    href: 'https://discuss.newrelic.com/',
  })
  .set(NR_SITES.LEARN, {
    text: 'Learn',
    href: 'https://learn.newrelic.com/',
  });

const createNavList = (listType, activeSite = null) => {
  const navList = [];
  HEADER_LINKS.forEach(({ text, href }) => {
    switch (listType) {
      case 'main':
        navList.push(
          <li key={href}>
            <GlobalNavLink
              href={href}
              activeSite={activeSite && HEADER_LINKS.get(activeSite)}
              instrumentation={{
                component: 'globalHeader',
                layoutElement: 'globalHeader',
              }}
            >
              {text}
            </GlobalNavLink>
          </li>
        );
        break;
      case 'dropdown':
        navList.push(
          <Dropdown.MenuItem key={href} href={href}>
            {text}
          </Dropdown.MenuItem>
        );
        break;
    }
  });
  return navList;
};

// removes the site nav from the header in favor of the search bar
// swaps out logo into collapsable nav
const NAV_BREAKPOINT = '1070px';
const LOGO_TEXT_BREAKPOINT = '460px';

const GlobalHeader = ({
  customStyles,
  className,
  activeSite,
  hideSearch = false,
}) => {
  const hasMounted = useHasMounted();
  const location = useLocation();
  const { queryParams, setQueryParam, deleteQueryParam } = useQueryParams();
  const { t } = useThemeTranslation();

  const {
    allLocale: { nodes: locales },
    site: {
      layout: { mobileBreakpoint },
    },
  } = useStaticQuery(graphql`
    query GlobalHeaderQuery {
      allLocale(sort: { fields: [isDefault, locale], order: [DESC, ASC] }) {
        nodes {
          locale
          localName
          isDefault
        }
      }
      site {
        layout {
          mobileBreakpoint
        }
      }
    }
  `);

  const hideLogoText = useMedia({ maxWidth: LOGO_TEXT_BREAKPOINT });

  const matchLocalePath = new RegExp(
    `^\\/(${locales.map(({ locale }) => locale).join('|')})`
  );

  const handleLocaleClick = useInstrumentedHandler(null, ({ locale }) => ({
    eventName: 'localeDropDownClick',
    category: 'LocaleDropDown',
    origin: 'gatsbyTheme',
    layoutElement: 'globalHeader',
    locale,
  }));

  return (
    <>
      <SearchModal
        onClose={() => {
          deleteQueryParam('q');
        }}
        isOpen={hasMounted && queryParams.has('q')}
      />
      <AnnouncementBanner />
      <div
        data-swiftype-index={false}
        className={className}
        css={css`
          background-color: var(--system-text-primary-light);
          box-shadow: var(--shadow-2);
          position: sticky;
          top: 0;
          z-index: 80;
        `}
      >
        <div
          css={css`
            height: var(--global-header-height);
            display: flex;
            justify-content: space-between;
            max-width: var(--site-max-width);
            margin: 0 auto;
            padding: 0 var(--site-content-padding);
          `}
        >
          <nav
            css={css`
              display: flex;
              align-items: center;
              height: 100%;
              overflow: hidden;
              position: relative;
            `}
          >
            <ExternalLink
              href="https://newrelic.com/"
              css={css`
                display: flex;
                align-items: center;

                @media screen and (max-width: ${NAV_BREAKPOINT}) {
                  display: none;
                }
              `}
              instrumentation={{
                component: 'globalHeaderLogo',
                layoutElement: 'globalHeader',
              }}
            >
              <NewRelicLogo
                size="150px"
                css={css`
                  .text-color {
                    fill: var(--color-white);
                  }
                `}
              />
            </ExternalLink>

            <Dropdown
              css={css`
                display: none;

                @media screen and (max-width: ${NAV_BREAKPOINT}) {
                  display: block;
                }
              `}
            >
              <Dropdown.Toggle
                size={Button.SIZE.EXTRA_SMALL}
                variant={Button.VARIANT.LINK}
                chevron={false}
                css={css`
                  padding-left: 0;
                  padding-right: 0;
                `}
              >
                <NewRelicLogo
                  size={hideLogoText ? '45px' : '150px'}
                  css={css`
                    .text-color {
                      fill: var(--color-white);
                    }
                  `}
                  omitText={hideLogoText}
                />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {createNavList('dropdown', activeSite)}
              </Dropdown.Menu>
            </Dropdown>

            <ul
              css={css`
                height: 100%;
                margin: 0;
                padding: 0;
                display: flex;
                list-style-type: none;
                white-space: nowrap;
                position: relative;
                margin-left: ${customStyles?.navLeftMargin || '120px'};

                li {
                  > a {
                    font-size: 18px;
                  }
                  &:first-child {
                    > a {
                      padding-left: 0px;
                    }
                  }
                }
                @media screen and (max-width: 1200px) {
                  margin-left: 2rem;
                }

                @media screen and (max-width: ${NAV_BREAKPOINT}) {
                  display: none;
                }
              `}
            >
              {createNavList('main', activeSite)}
            </ul>
          </nav>

          <ul
            css={css`
              margin: 0;
              margin-left: 1rem;
              padding: 0;
              display: flex;
              list-style-type: none;
              align-items: center;
              justify-content: flex-end;
              background: var(--system-text-primary-light);
              flex: 1;

              > li {
                transition: all 0.2s ease-out;

                &:not(:first-of-type) &:not(:last-of-type) {
                  margin-left: 0.5rem;
                }
              }
            `}
          >
            <li
              css={css`
                margin: 0rem 1rem;
                width: 100%;
                max-width: 320px;
                margin-right: ${customStyles?.searchRightMargin || '1rem'};

                @media screen and (max-width: 930px) {
                  margin-right: 1rem;
                }
                @media screen and (max-width: ${mobileBreakpoint}) {
                  display: none;
                }
              `}
            >
              {!hideSearch && (
                <>
                  <SearchInput
                    placeholder={t('searchInput.placeholder')}
                    size={SearchInput.SIZE.MEDIUM}
                    css={css`
                      --icon-size: 1.5rem;
                      min-width: 150px;
                      max-width: 450px;
                      svg {
                        width: 1.5rem;
                        height: 1.5rem;
                      }

                      input {
                        border: none;
                        height: 40px;
                      }
                    `}
                    onFocus={() => {
                      setQueryParam('q', '');
                    }}
                  />
                </>
              )}
            </li>
            <li
              css={css`
                display: flex;
                flex-direction: row;
                @media screen and (max-width: ${LOGO_TEXT_BREAKPOINT}) {
                  width: 100%;
                  justify-content: space-evenly;
                }
              `}
            >
              <Link
                to="?q="
                css={css`
                  color: var(--system-text-primary-dark);
                  transition: all 0.2s ease-out;
                  align-self: center;
                  padding-right: 1rem;
                  display: none;

                  @media screen and (max-width: ${mobileBreakpoint}) {
                    display: block;
                  }
                  @media screen and (max-width: ${mobileBreakpoint}) {
                    padding-right: 0.25rem;
                  }
                `}
              >
                <Icon
                  css={css`
                    cursor: pointer;
                    display: block;
                  `}
                  name="fe-search"
                  size="1.5rem"
                />
              </Link>
              {locales.length > 1 && (
                <Dropdown align="right">
                  <Dropdown.Toggle
                    size={Button.SIZE.EXTRA_SMALL}
                    variant={Button.VARIANT.LINK}
                    chevron={false}
                    css={css`
                      margin: 0;
                      height: 72px;
                      border-radius: 0px;
                      font-size: 0.75rem;
                      color: var(--system-text-primary-dark);
                      background: transparent;
                    `}
                  >
                    <Icon name="nr-i18n" size="20px" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {locales.map(({ isDefault, locale, localName }) => (
                      <Dropdown.MenuItem
                        as={Link}
                        key={locale}
                        href={path.join(
                          isDefault ? '' : `/${locale}`,
                          location.pathname.replace(matchLocalePath, '')
                        )}
                        onClick={() => handleLocaleClick({ locale })}
                      >
                        {localName}
                      </Dropdown.MenuItem>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              )}
              <DarkModeToggle
                css={css`
                  font-size: 0.75rem;
                  @media screen and (max-width: ${mobileBreakpoint}) {
                    margin: 0;
                  }
                  color: var(--system-text-primary-dark);
                `}
                size="27px"
              />
            </li>

            <li
              css={css`
                display: flex;
                align-items: right;
                flex-direction: row;
              `}
            >
              <Button
                as={ExternalLink}
                size={Button.SIZE.SMALL}
                variant={Button.VARIANT.LINK}
                href="https://one.newrelic.com"
                css={css`
                  white-space: nowrap;
                  font-size: 18px;
                  span {
                    color: var(--system-text-primary-dark);
                  }

                  @media screen and (max-width: ${mobileBreakpoint}) {
                    display: none;
                  }
                `}
                instrumentation={{
                  component: 'headerLogInButton',
                  layoutElement: 'globalHeader',
                }}
              >
                <span>{t('button.login')}</span>
              </Button>
              <SplitTextButton
                css={css`
                  padding-right: 0;
                  font-size: 18px;
                  span {
                    color: var(--brand-button-primary-accent);
                  }
                  @media screen and (max-width: ${mobileBreakpoint}) {
                    /* padding-right: 1rem; */
                  }
                `}
              />
            </li>
            <li
              css={css`
                display: flex;
              `}
            />
          </ul>
        </div>
      </div>
    </>
  );
};

GlobalHeader.propTypes = {
  className: PropTypes.string,
  customStyles: PropTypes.shape({
    navLeftMargin: PropTypes.string,
    searchRightMargin: PropTypes.string,
  }),
  activeSite: PropTypes.oneOf(Object.values(NR_SITES)),
  hideSearch: PropTypes.bool,
};

export default GlobalHeader;

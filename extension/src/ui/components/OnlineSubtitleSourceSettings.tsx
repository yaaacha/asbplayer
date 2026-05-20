import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import SettingsSection from '@project/common/components/SettingsSection';
import SettingsTextField from '@project/common/components/SettingsTextField';
import { OnlineSubtitleSourceConfig } from '@project/common/global-state';
import { ExtensionGlobalStateProvider } from '@/services/extension-global-state-provider';

interface Props {
    globalStateProvider: ExtensionGlobalStateProvider;
}

export default function OnlineSubtitleSourceSettings({ globalStateProvider }: Props) {
    const { t } = useTranslation();
    const [config, setConfig] = useState<OnlineSubtitleSourceConfig>({ jimakuApiKey: '' });
    const [initialized, setInitialized] = useState(false);
    const saveGenerationRef = useRef(0);

    useEffect(() => {
        let mounted = true;
        globalStateProvider
            .get(['onlineSubtitleSourceConfig'])
            .then(({ onlineSubtitleSourceConfig }) => {
                if (!mounted) return;
                setConfig(onlineSubtitleSourceConfig);
                setInitialized(true);
            })
            .catch(console.error);

        return () => {
            mounted = false;
        };
    }, [globalStateProvider]);

    useEffect(() => {
        if (!initialized) {
            return;
        }

        const generation = ++saveGenerationRef.current;
        const timeout = window.setTimeout(() => {
            const jimakuApiKey = config.jimakuApiKey.trim();
            const nextConfig = {
                ...config,
                jimakuApiKey,
                jimakuApiKeySavedAt: jimakuApiKey.length > 0 ? Date.now() : undefined,
            };

            globalStateProvider
                .set({ onlineSubtitleSourceConfig: nextConfig })
                .then(() => {
                    if (generation === saveGenerationRef.current) {
                        setConfig(nextConfig);
                    }
                })
                .catch(console.error);
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [config.jimakuApiKey, globalStateProvider, initialized]);

    return (
        <Stack spacing={1}>
            <SettingsSection>{t('onlineSubtitleSources.searchOnlineSubtitles')}</SettingsSection>
            <SettingsTextField
                label={t('onlineSubtitleSources.jimakuApiKey')}
                value={config.jimakuApiKey}
                type="password"
                disabled={!initialized}
                onChange={(e) => setConfig((current) => ({ ...current, jimakuApiKey: e.target.value }))}
                helperText={
                    <Stack component="span" spacing={0.5}>
                        <span>
                            <Trans
                                i18nKey="onlineSubtitleSources.jimakuApiKeyAutosaveHint"
                                components={[
                                    <Link
                                        key={0}
                                        href="https://jimaku.cc/account"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        underline="hover"
                                    >
                                        here.
                                    </Link>,
                                ]}
                            />
                        </span>
                        {config.jimakuApiKeySavedAt !== undefined && (
                            <Typography component="span" variant="caption">
                                {t('info.savedTimestamp', {
                                    timestamp: new Date(config.jimakuApiKeySavedAt).toLocaleString(),
                                })}
                            </Typography>
                        )}
                    </Stack>
                }
                fullWidth
                slotProps={{
                    input: {
                        endAdornment:
                            config.jimakuApiKey.trim().length > 0 ? (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={() => setConfig((current) => ({ ...current, jimakuApiKey: '' }))}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ) : undefined,
                    },
                }}
            />
        </Stack>
    );
}

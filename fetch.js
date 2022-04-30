const axios = require('axios').default;
const fs = require('fs');
const path = require('path');

function genSpecs(dtVersion) {
  return `
%global __brp_check_rpaths %{nil}
%global debug_package %{nil}
%define _build_id_links none
%undefine __arch_install_post
AutoReqProv: no

Name:           dingtalk-bin
Version:        ${dtVersion}
Release:        1%{?dist}
Summary:        钉钉


License:        Custom
URL:            https://gov.dingtalk.com
Source0:        https://dtapp-pub.dingtalk.com/dingtalk-desktop/xc_dingtalk_update/linux_deb/Release/com.alibabainc.dingtalk_%{version}_amd64.deb
Source1:        https://tms.dingtalk.com/markets/dingtalk/service-terms-zh
Source2:        dingtalk-bin.desktop
Source3:        dingtalk.svg
Source4:        dingtalk-launcher.sh
Source5:        libk5crypto.so.3
BuildRequires:  dpkg
# Requires:       zenity

%description
钉钉

%prep
%setup -T -c %{name}-%{version}
dpkg -X %{S:0} .
%define BUILD_DIR %{_builddir}/%{name}-%{version}

%build
cp %{S:1} ./LICENSE

%install
# Main program
install -d %{buildroot}/opt/dingtalk-bin
mv %{BUILD_DIR}/opt/apps/com.alibabainc.dingtalk/files/* %{buildroot}/opt/dingtalk-bin/

# Desktop file
install -Dm644 %{S:2} -t %{buildroot}%{_datarootdir}/applications/

# Icons
install -Dm644 %{S:3} -t %{buildroot}%{_datarootdir}/icons/hicolor/scalable/apps/

# Launcher
install -d %{buildroot}%{_bindir}
install -Dm755 %{S:4} %{buildroot}%{_bindir}/dingtalk

# Patch
install -Dm644 %{S:5} %{buildroot}/opt/dingtalk-bin/*Release*
rm -rf %{buildroot}/opt/dingtalk-bin/*Release*/{libm.so.6,Resources/{i18n/tool/*.exe,qss/mac}}
rm -rf %{buildroot}/opt/dingtalk-bin/*Release*/libgtk-x11-2.0.so.*

%files
%license LICENSE
%{_bindir}/dingtalk
%{_datarootdir}/applications/*
%{_datarootdir}/icons/hicolor/scalable/apps/*
/opt/dingtalk-bin/
`;
}

axios.get(
  'https://dtapp-pub.dingtalk.com/dingtalk-desktop/xc_dingtalk_update/linux_deb/Update/other/amd64/linux_dingtalk_update_package_gray.json'
).then((response) => {
  const data = response.data['install']['package'];
  const dtVersion = data['version'];
  const specs = genSpecs(dtVersion).replace('-Release', '');
  fs.writeFileSync(path.resolve(__dirname, 'build', 'SPECS', 'dingtalk-bin.spec'), specs);
});
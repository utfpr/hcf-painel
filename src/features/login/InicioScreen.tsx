import React from 'react';
import { Row, Col, Spin, Layout } from 'antd';

import LoginLayout from './LoginLayout';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import { useInicioScreenViewModel } from './view-models/useInicioScreenViewModel';
import { InicioScreenProps } from '../../@types/components';

const { Content } = Layout;

const InicioScreen: React.FC<InicioScreenProps> = (props) => {
  const viewModel = useInicioScreenViewModel(props);

  const renderLoginView = () => (
    <LoginLayout
      redirect={viewModel.handleRedirect}
      load={viewModel.handleLoad}
      requisicao={viewModel.handleRequestError}
    />
  );

  const renderForm = () => (
    <Layout>
      <Header onShowMobileMenu={viewModel.showMobileMenu} />
      <Content>
        <div className="container">
          <div className="divOpaca">
            <Row justify="center" style={{ width: '100%', padding: '20px' }}>
              <Col
                xs={24}
                sm={20}
                md={16}
                lg={12}
                xl={10}
                xxl={8}
              >
                <div className="contentForm">
                  {renderLoginView()}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      <MobileMenu
        visible={viewModel.mobileMenuVisible}
        onClose={viewModel.closeMobileMenu}
      />
    </Layout>
  );

  if (viewModel.loading) {
    return (
      <Spin tip="Carregando...">
        {renderForm()}
      </Spin>
    );
  }

  return renderForm();
};

export default InicioScreen;
